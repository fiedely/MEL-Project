import os
import requests

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')

def fetch_tmdb_context(movie_id, movie_title, media_type):
    """
    Fetches the essential metadata needed for AI analysis:
    Name, Year, Genres, and Search Context.
    """
    details = {}
    
    # 1. Resolve ID if only title provided
    if not movie_id and movie_title:
        tmdb_search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={movie_title}"
        search_data = requests.get(tmdb_search_url).json()
        if search_data.get('results'):
            best_match = search_data['results'][0]
            movie_id = best_match['id']
            media_type = best_match.get('media_type', 'movie')

    if not movie_id:
        return None

    # 2. Fetch Details
    endpoint = "tv" if media_type == 'tv' else "movie"
    details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=genres"
    details = requests.get(details_url).json()

    # 3. Format Data
    if media_type == 'tv':
        name = details.get('name')
        year = details.get('first_air_date', '')[:4]
        search_context = "TV Series"
    else:
        name = details.get('title')
        year = details.get('release_date', '')[:4]
        search_context = "Movie"
        
    genres_list = [g['name'] for g in details.get('genres', [])]
    genres_str = ", ".join(genres_list) if genres_list else "Unknown Genre"

    return {
        "name": name,
        "year": year,
        "search_context": search_context,
        "genres_str": genres_str
    }