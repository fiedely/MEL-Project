import json
import os
import requests

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    title_query = query_params.get('title')
    id_query = query_params.get('id')

    if not title_query and not id_query:
        return build_response(400, {"error": "Please provide a title or id"})

    try:
        tmdb_id = None
        
        # --- PATH A: DIRECT ID LOOKUP ---
        if id_query:
            tmdb_id = id_query

        # --- PATH B: SEARCH BY TITLE ---
        else:
            tmdb_search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title_query}"
            tmdb_response = requests.get(tmdb_search_url).json()
            results = tmdb_response.get('results', [])

            if not results:
                return build_response(404, {"error": "Subject not found"})

            if len(results) > 1:
                candidates = []
                for movie in results[:6]: 
                    release_date = movie.get('release_date', '')
                    year = release_date[:4] if release_date else "N/A"
                    candidates.append({
                        "id": movie['id'],
                        "title": movie['title'],
                        "year": year,
                        "poster": f"https://image.tmdb.org/t/p/w200{movie.get('poster_path')}" if movie.get('poster_path') else None,
                        "overview": movie.get('overview', '') 
                    })
                return build_response(200, {"candidates": candidates})
            
            tmdb_id = results[0]['id']

        # --- FETCH DETAILS ---
        tmdb_details_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={TMDB_API_KEY}&append_to_response=credits,external_ids,release_dates"
        details = requests.get(tmdb_details_url).json()
        imdb_id = details.get('external_ids', {}).get('imdb_id')

        # OMDB LOOKUP
        omdb_data = {}
        if imdb_id:
            omdb_url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}"
            omdb_data = requests.get(omdb_url).json()

        # --- DATA PROCESSING ---
        
        # 1. Crew Filtering
        crew = details.get('credits', {}).get('crew', [])
        
        def get_crew_by_job(job_title):
            return list(dict.fromkeys([m['name'] for m in crew if m['job'] == job_title]))

        producers = get_crew_by_job('Producer')
        cinematographers = get_crew_by_job('Director of Photography')
        composers = get_crew_by_job('Original Music Composer')
        if not composers:
            composers = get_crew_by_job('Music')

        # 2. Collection Info (With Full Movie List)
        collection_info = None
        collection_raw = details.get('belongs_to_collection')
        
        if collection_raw:
            try:
                col_id = collection_raw.get('id')
                col_url = f"https://api.themoviedb.org/3/collection/{col_id}?api_key={TMDB_API_KEY}"
                col_data = requests.get(col_url).json()
                
                parts = []
                for part in col_data.get('parts', []):
                    r_date = part.get('release_date', '')
                    parts.append({
                        "id": part.get('id'),
                        "title": part.get('title'),
                        "year": r_date[:4] if r_date else "N/A",
                        "poster": f"https://image.tmdb.org/t/p/w200{part.get('poster_path')}" if part.get('poster_path') else None
                    })
                
                # Sort by year (simple string sort usually works for YYYY, handle N/A by putting it last)
                parts.sort(key=lambda x: x['year'] if x['year'] != "N/A" else "9999")

                collection_info = {
                    "name": collection_raw.get('name'),
                    "parts": parts
                }
            except Exception as e:
                print(f"Collection fetch error: {e}")
                # Fallback if collection fetch fails
                collection_info = {"name": collection_raw.get('name'), "parts": []}

        # 3. Production Companies
        production_companies = [c['name'] for c in details.get('production_companies', [])]

        # BUILD REPORT
        mel_report = {
            "tmdb_id": tmdb_id,
            "title": details.get('title'),
            "tagline": details.get('tagline'),
            "year": details.get('release_date', '')[:4],
            "rated": omdb_data.get('Rated', 'N/A'),
            "runtime_minutes": details.get('runtime'),
            "plot": details.get('overview'),
            "poster": f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}" if details.get('poster_path') else None,
            "vote_average": details.get('vote_average', 0),
            "vote_count": details.get('vote_count', 0),
            "scores": {
                "imdb": omdb_data.get('imdbRating', 'N/A'),
                "metacritic": omdb_data.get('Metascore', 'N/A'),
                "rotten_tomatoes_critic": next((item['Value'] for item in omdb_data.get('Ratings', []) if item['Source'] == 'Rotten Tomatoes'), 'N/A'),
            },
            "awards": omdb_data.get('Awards', 'N/A'),
            "language": omdb_data.get('Language', 'English'),
            "budget": f"${details.get('budget', 0):,}" if details.get('budget') else "N/A",
            "revenue": f"${details.get('revenue', 0):,}" if details.get('revenue') else "N/A",
            "director": omdb_data.get('Director', 'N/A'),
            "writer": omdb_data.get('Writer', 'N/A'),
            "cast": [actor['name'] for actor in details.get('credits', {}).get('cast', [])[:4]],
            "genres": [g['name'] for g in details.get('genres', [])],
            "production": production_companies[:2],
            "producers": producers[:2],
            "cinematographers": cinematographers[:1],
            "composers": composers[:1],
            "collection": collection_info
        }

        return build_response(200, mel_report)

    except Exception as e:
        print(e)
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