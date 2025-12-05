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
    
    print(f"🧪 MEL Deep Analysis started for: {movie_title} (ID: {movie_id}, Type: {media_type})")

    try:
        details = {}
        
        # --- 1. FETCH TMDB DETAILS ---
        if movie_id:
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids"
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
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids"
            details = requests.get(details_url).json()
        
        else:
             return build_response(400, {"error": "Please provide 'id' or 'title'"})

        # --- 2. FETCH OMDB SCORES ---
        imdb_id = details.get('external_ids', {}).get('imdb_id')
        omdb_data = {}
        if imdb_id and OMDB_API_KEY:
            try:
                omdb_url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}"
                omdb_data = requests.get(omdb_url).json()
            except Exception as e:
                print(f"OMDb Error: {e}")

        # --- 3. PREPARE DATA ---
        tmdb_score = f"{round(details.get('vote_average', 0), 1)}/10"
        tmdb_votes = details.get('vote_count', 0)
        
        imdb_score = omdb_data.get('imdbRating', 'N/A')
        metascore = omdb_data.get('Metascore', 'N/A')
        tomatometer = next((i['Value'] for i in omdb_data.get('Ratings', []) if i['Source'] == 'Rotten Tomatoes'), 'N/A')

        genres_list = [g['name'] for g in details.get('genres', [])]
        genres_str = ", ".join(genres_list) if genres_list else "Unknown Genre"

        lab_data = {
            "popcorn_score": "N/A",
            "popcorn_votes": "N/A",
            "verdict": "Data Inconclusive",
            "suggestion": "Insufficient data for diagnosis."
        }

        # --- 4. GEMINI 2.5 FLASH ANALYSIS ---
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
                
                specific_search_query = f"popcornmeter and ratings for '{name}' ({year})"

                prompt = f"""
                KNOWN DATA (Use as facts):
                1. TMDB Score (Enthusiasts): {tmdb_score} ({tmdb_votes} votes)
                2. IMDb Score (General Public): {imdb_score}
                3. Metascore (Top Critics): {metascore}
                4. Tomatometer (Critic Consensus): {tomatometer}
                5. Primary Genres: {genres_str}

                TASK:
                1. Use Google Search with exactly this query: "{specific_search_query}"
                2. Scan the search result and extract ONLY the POPCORNMETER score (as percentage) and number of RATINGS.
                3. Compare the Popcornmeter (Verified Audience) against the KNOWN DATA (Critics & other Audiences).
                4. Generate a "Clinical Diagnosis".

                STRICT OUTPUT RULES:
                - **popcorn_score/ratings**: Extract exact numbers or "N/A".
                
                - **verdict**: MUST be 1 or 2 words MAX. Use fun scientific/clinical jargon. 

                - **suggestion**: 
                  - Write exactly 2 paragraphs.
                  - **DO NOT REPEAT THE SCORES.** We can already see them.
                  - **TONE:** "Accessible Science." Use lab jargon (Experiment, Data, Analysis, Hypothesis) only for flavor/vibes, but keep the sentences simple, fun, and easy to read. Avoid overly dense academic language.
                  - Para 1: Analyze the vibe. Do critics and fans agree? Is it a fun popcorn flick or a serious drama?
                  - Para 2: Recommendation. Who is this experiment for? Explicitly reference the **Genres** ({genres_str}). Use **bold** for 2-4 key traits.

                JSON Schema:
                {{
                    "popcorn_score": "String",
                    "popcorn_votes": "String",
                    "verdict": "String",
                    "suggestion": "String"
                }}
                """

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
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

        # --- BUILD REPORT ---
        report = {
            "facts": {
                "tmdb_score": tmdb_score,
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