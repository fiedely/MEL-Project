import json
import os
import requests

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters') or {}
    title_query = query_params.get('title')
    id_query = query_params.get('id')
    type_query = query_params.get('type', 'movie') 
    page_query = query_params.get('page', '1')

    if not title_query and not id_query:
        return build_response(400, {"error": "Please provide a title or id"})

    try:
        if id_query:
            if type_query == 'tv':
                return fetch_tv_details(id_query)
            else:
                return fetch_movie_details(id_query)

        else:
            try:
                app_page = int(page_query)
            except ValueError:
                app_page = 1

            tmdb_page = (app_page - 1) // 2 + 1
            is_second_half = (app_page % 2 == 0)

            tmdb_search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={title_query}&page={tmdb_page}"
            tmdb_response = requests.get(tmdb_search_url).json()
            
            raw_results = tmdb_response.get('results', [])
            results = [r for r in raw_results if r.get('media_type') in ['movie', 'tv']]
            
            total_tmdb_pages = tmdb_response.get('total_pages', 1)
            results.sort(key=lambda x: x.get('popularity', 0), reverse=True)

            if not results and app_page == 1:
                return build_response(404, {"error": "Subject not found"})

            if app_page == 1 and len(results) == 1:
                media_type = results[0].get('media_type', 'movie')
                if media_type == 'tv':
                    return fetch_tv_details(results[0]['id'])
                else:
                    return fetch_movie_details(results[0]['id'])
            
            else:
                start_index = 10 if is_second_half else 0
                end_index = 20 if is_second_half else 10
                page_results = results[start_index:end_index]
                
                candidates = []
                for item in page_results: 
                    m_type = item.get('media_type', 'movie')
                    title = item.get('name') if m_type == 'tv' else item.get('title')
                    date = item.get('first_air_date') if m_type == 'tv' else item.get('release_date')
                    year = date[:4] if date else "N/A"
                    
                    candidates.append({
                        "id": item['id'],
                        "title": title,
                        "year": year,
                        "media_type": m_type,
                        "poster": f"https://image.tmdb.org/t/p/w200{item.get('poster_path')}" if item.get('poster_path') else None,
                        "overview": item.get('overview', '') 
                    })
                
                return build_response(200, {
                    "candidates": candidates,
                    "page": app_page,
                    "total_pages": total_tmdb_pages * 2 
                })

    except Exception as e:
        print(f"Handler Error: {e}")
        return build_response(500, {"error": str(e)})

# --- HELPER: MOVIE DETAILS ---
def fetch_movie_details(tmdb_id):
    tmdb_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={TMDB_API_KEY}&append_to_response=credits,external_ids,release_dates,videos,keywords,recommendations"
    details = requests.get(tmdb_url).json()
    imdb_id = details.get('external_ids', {}).get('imdb_id')

    omdb_data = {}
    if imdb_id:
        omdb_data = requests.get(f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}").json()

    crew = details.get('credits', {}).get('crew', [])
    def get_crew(job): return list(dict.fromkeys([m['name'] for m in crew if m['job'] == job]))[:2]

    col_info = None
    col_raw = details.get('belongs_to_collection')
    if col_raw:
        try:
            col_data = requests.get(f"https://api.themoviedb.org/3/collection/{col_raw['id']}?api_key={TMDB_API_KEY}").json()
            parts = [{
                "id": p['id'], 
                "title": p['title'], 
                "year": p.get('release_date', '')[:4], 
                "poster": f"https://image.tmdb.org/t/p/w200{p.get('poster_path')}" if p.get('poster_path') else None,
                "media_type": "movie"
            } for p in col_data.get('parts', [])]
            parts.sort(key=lambda x: x['year'] if x['year'] != "N/A" else "9999")
            col_info = {"name": col_raw['name'], "parts": parts}
        except: pass

    recs = [{
        "id": r['id'], "title": r['title'], "year": r.get('release_date', '')[:4], "media_type": "movie",
        "poster": f"https://image.tmdb.org/t/p/w200{r.get('poster_path')}" if r.get('poster_path') else None
    } for r in details.get('recommendations', {}).get('results', [])[:10]]

    videos = details.get('videos', {}).get('results', [])
    trailer = next((v['key'] for v in videos if v['site'] == 'YouTube' and v['type'] == 'Trailer'), None)

    return build_response(200, {
        "tmdb_id": tmdb_id,
        "media_type": "movie",
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
            "rotten_tomatoes_critic": next((i['Value'] for i in omdb_data.get('Ratings', []) if i['Source'] == 'Rotten Tomatoes'), 'N/A'),
        },
        "awards": omdb_data.get('Awards', 'N/A'),
        "language": details.get('original_language', 'en').upper(),
        "budget": f"${details.get('budget', 0):,}" if details.get('budget') else "N/A",
        "revenue": f"${details.get('revenue', 0):,}" if details.get('revenue') else "N/A",
        "director": omdb_data.get('Director', 'N/A'),
        "writer": omdb_data.get('Writer', 'N/A'),
        "production": [c['name'] for c in details.get('production_companies', [])][:2],
        "producers": get_crew('Producer'),
        "cinematographers": get_crew('Director of Photography'),
        "composers": get_crew('Original Music Composer') or get_crew('Music'),
        "cast": [{"name": a['name'], "profile_path": f"https://image.tmdb.org/t/p/w200{a['profile_path']}" if a.get('profile_path') else None} for a in details.get('credits', {}).get('cast', [])[:30]],
        "genres": [g['name'] for g in details.get('genres', [])],
        "collection": col_info,
        "trailer_key": trailer,
        "keywords": [k['name'] for k in details.get('keywords', {}).get('keywords', [])][:10],
        "recommendations": recs
    })

# --- HELPER: TV DETAILS ---
def fetch_tv_details(tmdb_id):
    tmdb_url = f"https://api.themoviedb.org/3/tv/{tmdb_id}?api_key={TMDB_API_KEY}&append_to_response=credits,external_ids,videos,keywords,recommendations,content_ratings"
    details = requests.get(tmdb_url).json()
    imdb_id = details.get('external_ids', {}).get('imdb_id')

    omdb_data = {}
    if imdb_id:
        omdb_data = requests.get(f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}").json()

    # Timeline
    start_year = details.get('first_air_date', '')[:4]
    end_year = details.get('last_air_date', '')[:4]
    status = details.get('status', 'Unknown')
    timeline = f"{start_year} - {end_year if status == 'Ended' else 'Present'}"

    # Crew & Personnel
    creators = [c['name'] for c in details.get('created_by', [])]
    crew = details.get('credits', {}).get('crew', [])
    
    # Extract Executive Producers for TV
    exec_producers = list(dict.fromkeys([m['name'] for m in crew if m['job'] == 'Executive Producer']))[:3]
    
    # Seasons
    seasons = []
    for s in details.get('seasons', []):
        if s['season_number'] > 0:
            # [UPDATED] Added Year logic here
            air_date = s.get('air_date')
            s_year = air_date[:4] if air_date else "N/A"
            episode_count = s.get('episode_count', 0)
            
            seasons.append({
                "id": s['id'],
                "title": s['name'],
                # Combine Year and Episode count
                "year": f"{s_year} | {episode_count} Eps",
                "poster": f"https://image.tmdb.org/t/p/w200{s.get('poster_path')}" if s.get('poster_path') else None,
                "media_type": "tv_season"
            })
    collection_info = {"name": "Season Manifest", "parts": seasons}

    recs = [{
        "id": r['id'], "title": r['name'], "year": r.get('first_air_date', '')[:4], "media_type": "tv",
        "poster": f"https://image.tmdb.org/t/p/w200{r.get('poster_path')}" if r.get('poster_path') else None
    } for r in details.get('recommendations', {}).get('results', [])[:10]]

    videos = details.get('videos', {}).get('results', [])
    trailer = next((v['key'] for v in videos if v['site'] == 'YouTube' and v['type'] == 'Trailer'), None)

    return build_response(200, {
        "tmdb_id": tmdb_id,
        "media_type": "tv",
        "title": details.get('name'),
        "tagline": details.get('tagline'),
        "year": timeline,
        "rated": omdb_data.get('Rated', 'N/A'),
        "status": status,
        "plot": details.get('overview'),
        "poster": f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}" if details.get('poster_path') else None,
        "vote_average": details.get('vote_average', 0),
        "vote_count": details.get('vote_count', 0),
        "scores": {
            "imdb": omdb_data.get('imdbRating', 'N/A'),
            "metacritic": "N/A", 
            "rotten_tomatoes_critic": next((i['Value'] for i in omdb_data.get('Ratings', []) if i['Source'] == 'Rotten Tomatoes'), 'N/A'),
        },
        "awards": omdb_data.get('Awards', 'N/A'),
        "language": details.get('original_language', 'en').upper(),
        "budget": "N/A",
        "revenue": "N/A",
        "director": None, 
        "creators": creators, 
        "writer": omdb_data.get('Writer', 'N/A'),
        "networks": [n['name'] for n in details.get('networks', [])],
        "production": [c['name'] for c in details.get('production_companies', [])][:2], 
        "producers": exec_producers,
        "cast": [{"name": a['name'], "profile_path": f"https://image.tmdb.org/t/p/w200{a['profile_path']}" if a.get('profile_path') else None} for a in details.get('credits', {}).get('cast', [])[:30]],
        "genres": [g['name'] for g in details.get('genres', [])],
        "collection": collection_info,
        "trailer_key": trailer,
        "keywords": [k['name'] for k in details.get('keywords', {}).get('results', [])][:10],
        "recommendations": recs
    })

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