import json
import os
import requests
from google import genai
from google.genai import types

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    movie_title = query_params.get('title')
    movie_id = query_params.get('id')
    media_type = query_params.get('type', 'movie') 
    
    print(f"🧪 MEL Deep Analysis started for: {movie_title} (ID: {movie_id}, Type: {media_type})")

    try:
        details = {}
        
        if movie_id:
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}"
            details = requests.get(details_url).json()
            
            if 'status_code' in details and details['status_code'] == 34:
                 return build_response(404, {"error": "ID not found"})

        elif movie_title:
            tmdb_search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={movie_title}"
            search_data = requests.get(tmdb_search_url).json()
            
            if not search_data.get('results'):
                 return build_response(404, {"error": "Subject not found"})
            
            results = search_data['results']
            best_match = results[0]
            
            movie_id = best_match['id']
            media_type = best_match.get('media_type', 'movie')
            
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}"
            details = requests.get(details_url).json()
        
        else:
             return build_response(400, {"error": "Please provide 'id' or 'title'"})

        tmdb_score = details.get('vote_average', 0)
        tmdb_votes = details.get('vote_count', 0)
        
        lab_data = {
            "popcorn_score": "N/A",
            "popcorn_votes": "N/A",
            "verdict": "Analysis Failed",
            "suggestion": "Could not connect to AI Lab."
        }

        if GEMINI_API_KEY:
            try:
                client = genai.Client(api_key=GEMINI_API_KEY)
                grounding_tool = types.Tool(google_search=types.GoogleSearch())

                if media_type == 'tv':
                    name = details.get('name')
                    year = details.get('first_air_date', '')[:4]
                    search_context = "TV Series"
                else:
                    name = details.get('title')
                    year = details.get('release_date', '')[:4]
                    search_context = "Movie"
                
                specific_search_query = f"site:rottentomatoes.com the popcornmeter and ratings for '{name}' {search_context} ({year})"

                # [FIX] Enhanced prompt to enforce 'N/A'
                prompt = f"""
                Step 1: Use Google Search with exactly this query: "{specific_search_query}"

                Step 2: Scan the search result and extract ONLY the POPCORNMETER score (as percentage) and number of RATINGS.
                
                Step 3: Return VALID JSON only based on the search results.
                
                Instructions for data fields:
                - If Popcornmeter score is found, put percentage (e.g. "95%"). If NOT found, put "N/A".
                - If Ratings count is found, put the number (e.g. "5,000+ Ratings"). If NOT found, put "N/A" (do NOT put empty string or null).

                Instructions for 'suggestion':
                1. Write exactly 2 concise paragraphs report separated with newline.
                2. Include assesment on this {search_context}'s entertainment value based on TMDB and Popcornmeter scores.
                3. Include suggestions for what type of audience would enjoy this {search_context} the most.
                4. Use **bold markdown** for 2-4 key phrases.
                5. Be precise and scientific in tone.

                JSON Schema:
                {{
                    "popcorn_score": "e.g. 95% or N/A",
                    "popcorn_votes": "e.g. 7,000+ Ratings or N/A",
                    "verdict": "Short 1-2 words creative verdict (e.g. Biohazard, Prime Specimen)",
                    "suggestion": "2 paragraphs with bold keywords."
                }}
                """

                response = client.models.generate_content(
                    model="gemini-2.5-pro",
                    contents=prompt,
                    config=types.GenerateContentConfig(tools=[grounding_tool])
                )
                
                if response.text:
                    text = response.text.replace('```json', '').replace('```', '').strip()
                    try:
                        lab_data = json.loads(text)
                    except json.JSONDecodeError:
                        print(f"⚠️ JSON Parse Error: {text}")
                        lab_data["suggestion"] = "AI returned invalid data format."
            
            except Exception as ai_error:
                print(f"⚠️ AI Error: {ai_error}")
                lab_data["suggestion"] = f"AI Error: {str(ai_error)}"

        report = {
            "facts": {
                "tmdb_score": f"{round(tmdb_score, 1)}/10",
                "tmdb_votes": f"{tmdb_votes:,} Votes",
                "popcorn_score": lab_data.get('popcorn_score', 'N/A'),
                "popcorn_votes": lab_data.get('popcorn_votes', 'N/A')
            },
            "result": {
                "verdict": lab_data.get('verdict', 'Unknown'),
                "suggestion": lab_data.get('suggestion', 'No suggestion available.')
            }
        }

        return build_response(200, report)

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