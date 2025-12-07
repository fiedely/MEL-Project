import json
import os
from google import genai
from services.common import fetch_tmdb_context
from services.score import analyze_score
from services.synopsis import analyze_synopsis
from services.composition import analyze_composition

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Safety Config (Global)
SAFETY_CONFIG = [
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"}
]

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    movie_title = query_params.get('title')
    movie_id = query_params.get('id')
    media_type = query_params.get('type', 'movie')
    mode = query_params.get('mode', 'score') 
    season_query = query_params.get('season') 

    try:
        # 1. FETCH DETAILS (Common)
        ctx = fetch_tmdb_context(movie_id, movie_title, media_type)
        if not ctx:
            return build_response(404, {"error": "Subject not found"})

        # 2. INIT CLIENT
        if not GEMINI_API_KEY:
            return build_response(500, {"error": "Server Configuration Error"})
            
        client = genai.Client(api_key=GEMINI_API_KEY)
        data = {}

        # 3. ROUTE TO SERVICE
        if mode == 'score':
            data = analyze_score(client, ctx, SAFETY_CONFIG)
        elif mode == 'synopsis':
            data = analyze_synopsis(client, ctx, season_query, SAFETY_CONFIG)
        elif mode == 'composition':
            data = analyze_composition(client, ctx, SAFETY_CONFIG)
        else:
            return build_response(400, {"error": "Invalid mode"})

        return build_response(200, data)

    except Exception as e:
        return build_response(500, {"error": str(e)})

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, OPTIONS" },
        "body": json.dumps(body)
    }