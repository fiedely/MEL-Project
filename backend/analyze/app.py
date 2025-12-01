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

        # 3. GEMINI 2.5 FLASH ANALYSIS
        if GEMINI_API_KEY:
            try:
                # Initialize Client
                client = genai.Client(api_key=GEMINI_API_KEY)

                # Configure Tool
                grounding_tool = types.Tool(
                    google_search=types.GoogleSearch()
                )

                # --- SPECIFIC SEARCH PHRASE CONSTRUCTION ---
                movie_name = details.get('title')
                release_year = details.get('release_date', '')[:4]
                # We append the year to the movie name to ensure we get the right movie
                # But we keep the search phrase structure you requested.
                specific_search_query = f"site:rottentomatoes.com the popcornmeter and ratings for '{movie_name}' '({release_year})'"

                # Define the Prompt
                prompt = f"""
                Step 1: Use Google Search with exactly this query: "{specific_search_query}"

                Step 2: Scan the search result and extract ONLY the POPCORNMETER score (as percentage) and number of RATINGS (e.g. "7,000+ Ratings")
                
                Step 3: Return VALID JSON only based on the search results. Do not add markdown formatting to the json block.
                
                Instructions for 'suggestion':
                1. Write exactly 2 concise paragraphs report separated with newline.
                2. Include assesment on movie's entertainment value based on TMDB and Popcornmeter scores data.
                3. Include suggestions for what type of audience would enjoy this movie the most.
                4. Use **bold markdown** for 2-4 key phrases or important takeaways (e.g. **highly recommended**, **slow pacing**, **visual masterpiece**).
                5. Be precise and scientific in tone, you are a laboratorium agent in duty.

                JSON Schema:
                {{
                    "popcorn_score": "e.g. 95%",
                    "popcorn_votes": "e.g. 7,000+ Ratings",
                    "verdict": "Short 1 or 2 words creative verdict based on data nuance with science lab theme (e.g. Biohazard, Prime Specimen, Volatile, Stable)",
                    "suggestion": "2 paragraphs with **bold** keywords included."
                }}
                """

                # Generate Content
                response = client.models.generate_content(
                    model="gemini-2.5-pro",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[grounding_tool]
                    )
                )
                
                # Parse Response
                if response.text:
                    # Clean up markdown if present
                    text = response.text.replace('```json', '').replace('```', '').strip()
                    try:
                        lab_data = json.loads(text)
                    except json.JSONDecodeError:
                        print(f"⚠️ JSON Parse Error. Raw text: {text}")
                        lab_data["suggestion"] = "AI returned invalid data format."
            
            except Exception as ai_error:
                print(f"⚠️ AI Error: {ai_error}")
                lab_data["suggestion"] = f"AI Error: {str(ai_error)}"

        # 4. BUILD REPORT
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