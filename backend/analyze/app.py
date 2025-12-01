import json
import os
import requests
import google.generativeai as genai

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    movie_title = query_params.get('title')
    
    print(f"🧪 MEL Deep Analysis started for: {movie_title}")

    try:
        # 1. FETCH TMDB DATA
        tmdb_search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_title}"
        search_data = requests.get(tmdb_search_url).json()
        
        if not search_data.get('results'):
             return build_response(404, {"error": "Movie not found"})
        
        results = search_data['results']
        best_match = results[0]
        for movie in results:
            if movie['title'].lower().strip() == movie_title.lower().strip():
                best_match = movie
                break
        
        movie_id = best_match['id']
        details_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
        details = requests.get(details_url).json()
        
        tmdb_score = details.get('vote_average', 0)
        tmdb_votes = details.get('vote_count', 0)

        # 2. DEFAULT REPORT
        lab_data = {
            "popcorn_score": "N/A",
            "popcorn_votes": "N/A",
            "verdict": "Analysis Failed",
            "suggestion": "Could not connect to AI Lab."
        }

        if GEMINI_API_KEY:
            try:
                # --- THE FIX ---
                # 1. Initialize Model WITHOUT tools (Safe for all versions)
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                # 2. Define Tools Configuration
                tools_config = [
                    {'google_search': {}} 
                ]
                
                prompt = f"""
                Use Google Search to find the REAL Rotten Tomatoes Audience Score (Popcornmeter) for '{details.get('title')}' ({details.get('release_date', '')[:4]}).
                
                Return JSON only:
                {{
                    "popcorn_score": "e.g. 95%",
                    "popcorn_votes": "e.g. 250,000+ Ratings",
                    "verdict": "Scientific verdict (e.g. Certified Fresh)",
                    "suggestion": "Two paragraphs: Consensus summary + Watch recommendation."
                }}
                """
                
                # 3. Pass tools HERE instead
                response = model.generate_content(
                    prompt,
                    tools=tools_config
                )
                
                # Parse
                if response.text:
                    text = response.text.replace('```json', '').replace('```', '').strip()
                    lab_data = json.loads(text)
            
            except Exception as ai_error:
                print(f"⚠️ AI Error: {ai_error}")
                lab_data["suggestion"] = f"AI Error: {str(ai_error)}"

        # 3. BUILD REPORT
        report = {
            "facts": {
                "tmdb_score": f"{round(tmdb_score, 1)}/10",
                "tmdb_votes": f"{tmdb_votes:,} Votes",
                "popcorn_score": lab_data.get('popcorn_score'),
                "popcorn_votes": lab_data.get('popcorn_votes')
            },
            "result": {
                "verdict": lab_data.get('verdict'),
                "suggestion": lab_data.get('suggestion')
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