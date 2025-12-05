import json
import os
import requests
from google import genai
from google.genai import types

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    movie_title = query_params.get('title')
    movie_id = query_params.get('id')
    media_type = query_params.get('type', 'movie')
    mode = query_params.get('mode', 'score') 
    # [NEW] Capture season selection
    season_query = query_params.get('season') 
    
    print(f"🧪 MEL Analysis: {mode.upper()} for {movie_title} ({media_type})")

    try:
        # --- 1. FETCH DETAILS (Needed for both modes) ---
        details = {}
        if movie_id:
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids"
            details = requests.get(details_url).json()
        elif movie_title:
            tmdb_search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={movie_title}"
            search_data = requests.get(tmdb_search_url).json()
            if not search_data.get('results'): return build_response(404, {"error": "Subject not found"})
            best_match = search_data['results'][0]
            movie_id = best_match['id']
            media_type = best_match.get('media_type', 'movie')
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids"
            details = requests.get(details_url).json()
        else:
             return build_response(400, {"error": "Please provide 'id' or 'title'"})

        if media_type == 'tv':
            name = details.get('name')
            year = details.get('first_air_date', '')[:4]
            search_context = "TV Series"
        else:
            name = details.get('title')
            year = details.get('release_date', '')[:4]
            search_context = "Movie"

        # --- MODE A: FETCH POPCORNMETER SCORE ---
        if mode == 'score':
            lab_data = {"popcorn_score": "N/A"}
            
            if GEMINI_API_KEY:
                try:
                    client = genai.Client(api_key=GEMINI_API_KEY)
                    grounding_tool = types.Tool(google_search=types.GoogleSearch())
                    
                    # [FIX] Tuned search query as requested
                    specific_search_query = f"site:rottentomatoes.com popcornmeter for '{name}' ({year})"
                    
                    prompt = f"""
                    TASK:
                    1. Use Google Search with exactly this query: "{specific_search_query}"
                    2. Scan the search result and extract ONLY the POPCORNMETER score (as percentage).
                    
                    JSON Schema:
                    {{
                        "popcorn_score": "String (e.g. 95% or N/A)"
                    }}
                    """
                    
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt,
                        config=types.GenerateContentConfig(tools=[grounding_tool])
                    )
                    
                    if response.text:
                        text = response.text.replace('```json', '').replace('```', '').strip()
                        lab_data = json.loads(text)
                        
                except Exception as e:
                    print(f"AI Error: {e}")
            
            return build_response(200, lab_data)

        # --- MODE B: GENERATE FULL SYNOPSIS (DECLASSIFIED FILE) ---
        elif mode == 'synopsis':
            synopsis_data = {"full_plot": "Data Restricted.", "detailed_ending": "Redacted."}
            
            if GEMINI_API_KEY:
                try:
                    client = genai.Client(api_key=GEMINI_API_KEY)
                    
                    if season_query:
                        task_target = f"{season_query} of the TV Series '{name}'"
                    else:
                        task_target = f"the {search_context} '{name}' ({year})"
                    
                    prompt = f"""
                    TASK: 
                    Write a detailed "Declassified Specimen File" for {task_target}.
                    
                    INSTRUCTIONS:
                    1. **The Plot**: Write a comprehensive synopsis of the story flow. Do not just summarize; narrate the journey engagingly.
                    2. **The Ending**: Clearly separate and explain the ending (or season finale), including all major spoilers, twists, and the final resolution.
                    3. **Tone**: Professional, engaging, and easy to read (like a high-quality magazine feature or a clean wiki summary). Do not use overly dry or robotic language.
                    4. **Formatting**: Use **bold markdown** to emphasize important plotlines, key events, or critical twists. This allows users to speed-read the file and grasp the essentials quickly.

                    JSON Schema:
                    {{
                        "full_plot": "String (Multi-paragraph rich text)",
                        "detailed_ending": "String (Multi-paragraph rich text)"
                    }}
                    """
                    
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt
                    )
                    
                    if response.text:
                        text = response.text.replace('```json', '').replace('```', '').strip()
                        synopsis_data = json.loads(text)

                except Exception as e:
                    print(f"AI Error: {e}")
                    synopsis_data["full_plot"] = "Error generating file."

            return build_response(200, synopsis_data)

        else:
             return build_response(400, {"error": "Invalid mode"})

    except Exception as e:
        return build_response(500, {"error": str(e)})

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        },
        "body": json.dumps(body)
    }