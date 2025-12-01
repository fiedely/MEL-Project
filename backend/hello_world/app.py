import json
import os
import requests

# We ONLY need these keys for the fast search
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    movie_title = query_params.get('title')

    if not movie_title:
        return build_response(400, {"error": "Please provide a movie title"})

    try:
        # 1. TMDB SEARCH
        tmdb_search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_title}"
        tmdb_response = requests.get(tmdb_search_url).json()
        
        results = tmdb_response.get('results')
        if not results:
            return build_response(404, {"error": "Subject not found"})

        # --- SMART MATCH LOGIC ---
        # Default to the first result (popularity)
        best_match = results[0]
        
        # But if we find an EXACT title match (case-insensitive), prefer that!
        # This fixes "Now You See Me" vs "Now You See Me 2"
        for movie in results:
            if movie['title'].lower().strip() == movie_title.lower().strip():
                best_match = movie
                break
        
        tmdb_id = best_match['id']
        
        # 2. TMDB DETAILS (Budget, Revenue, Cast, Release Dates)
        tmdb_details_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={TMDB_API_KEY}&append_to_response=credits,external_ids,release_dates"
        details = requests.get(tmdb_details_url).json()
        imdb_id = details.get('external_ids', {}).get('imdb_id')

        # 3. OMDB LOOKUP (Ratings, Writer, Language)
        omdb_data = {}
        if imdb_id:
            omdb_url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}"
            omdb_data = requests.get(omdb_url).json()

        # 4. BUILD REPORT (NO AI HERE - FAST!)
        mel_report = {
            "tmdb_id": tmdb_id, # We pass this ID to the frontend so it can ask for the Analysis later
            "title": details.get('title'),
            "year": details.get('release_date', '')[:4],
            "rated": omdb_data.get('Rated', 'N/A'),
            "runtime_minutes": details.get('runtime'),
            "plot": details.get('overview'),
            "poster": f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}" if details.get('poster_path') else None,
            
            # === NEW FIELDS FOR PROGRESSIVE LOADING ===
            "vote_average": details.get('vote_average', 0),
            "vote_count": details.get('vote_count', 0),
            # ==========================================

            "scores": {
                "imdb": omdb_data.get('imdbRating', 'N/A'),
                "metacritic": omdb_data.get('Metascore', 'N/A'),
                "rotten_tomatoes_critic": next((item['Value'] for item in omdb_data.get('Ratings', []) if item['Source'] == 'Rotten Tomatoes'), 'N/A'),
            },
            "language": omdb_data.get('Language', 'English'),
            "budget": f"${details.get('budget', 0):,}" if details.get('budget') else "N/A",
            "revenue": f"${details.get('revenue', 0):,}" if details.get('revenue') else "N/A",
            "director": omdb_data.get('Director', 'N/A'),
            "writer": omdb_data.get('Writer', 'N/A'),
            "cast": [actor['name'] for actor in details.get('credits', {}).get('cast', [])[:4]],
            "genres": [g['name'] for g in details.get('genres', [])]
        }

        return build_response(200, mel_report)

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