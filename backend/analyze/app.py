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
    season_query = query_params.get('season') 
    
    print(f"🧪 MEL Analysis: {mode.upper()} for {movie_title} ({media_type})")

    try:
        # --- 1. FETCH DETAILS (Common) ---
        details = {}
        if movie_id:
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids,genres"
            details = requests.get(details_url).json()
        elif movie_title:
            tmdb_search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={movie_title}"
            search_data = requests.get(tmdb_search_url).json()
            if not search_data.get('results'): return build_response(404, {"error": "Subject not found"})
            best_match = search_data['results'][0]
            movie_id = best_match['id']
            media_type = best_match.get('media_type', 'movie')
            endpoint = "tv" if media_type == 'tv' else "movie"
            details_url = f"https://api.themoviedb.org/3/{endpoint}/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=external_ids,genres"
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
            
        genres_list = [g['name'] for g in details.get('genres', [])]
        genres_str = ", ".join(genres_list) if genres_list else "Unknown Genre"

        # [FIX] SAFETY CONFIGURATION (Allow Horror/Gore Analysis)
        safety_config = [
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"}
        ]

        # --- MODE A: FETCH POPCORNMETER SCORE ---
        if mode == 'score':
            lab_data = {"popcorn_score": "N/A"}
            if GEMINI_API_KEY:
                try:
                    client = genai.Client(api_key=GEMINI_API_KEY)
                    grounding_tool = types.Tool(google_search=types.GoogleSearch())
                    specific_search_query = f"site:rottentomatoes.com popcornmeter for '{name}' ({year})"
                    prompt = f"""
                    TASK: Use Google Search for "{specific_search_query}". Extract ONLY the Popcornmeter score percentage.
                    JSON Schema: {{ "popcorn_score": "String (e.g. 95% or N/A)" }}
                    """
                    response = client.models.generate_content(
                        model="gemini-2.5-flash", 
                        contents=prompt, 
                        config=types.GenerateContentConfig(
                            tools=[grounding_tool],
                            safety_settings=safety_config # Apply Safety Config
                        )
                    )
                    if response.text:
                        lab_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                except Exception as e: print(f"AI Error: {e}")
            return build_response(200, lab_data)

        # --- MODE B: GENERATE FULL SYNOPSIS ---
        elif mode == 'synopsis':
            synopsis_data = {"full_plot": "Data Restricted.", "detailed_ending": "Redacted."}
            if GEMINI_API_KEY:
                try:
                    client = genai.Client(api_key=GEMINI_API_KEY)
                    task_target = f"{season_query} of the TV Series '{name}'" if season_query else f"the {search_context} '{name}' ({year})"
                    prompt = f"""
                    TASK: Write a detailed "Declassified Specimen File" for {task_target}.
                    INSTRUCTIONS:
                    1. Plot: Comprehensive synopsis.
                    2. Ending: Detailed ending/resolution with spoilers.
                    3. Formatting: Use **bold markdown** for key events.
                    JSON Schema: {{ "full_plot": "String", "detailed_ending": "String" }}
                    """
                    response = client.models.generate_content(
                        model="gemini-2.5-flash", 
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            safety_settings=safety_config # Apply Safety Config
                        )
                    )
                    if response.text:
                        synopsis_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                except Exception as e: print(f"AI Error: {e}")
            return build_response(200, synopsis_data)

        # --- MODE C: COMPOSITION ANALYSIS (MEL'S REPORT) ---
        elif mode == 'composition':
            composition_data = {}
            if GEMINI_API_KEY:
                try:
                    client = genai.Client(api_key=GEMINI_API_KEY)
                    prompt = f"""
                    TASK: Act as a Senior Film Pathologist. Analyze the {search_context}: "{name}" ({year}). Genres: {genres_str}.
                    Estimate the INTENSITY level (0-100) for these 16 specific attributes based on content analysis.
                    
                    DEFINITIONS FOR SCORING (0=None, 100=Extreme/Maximum):
                    
                    1. **EMOTIONAL RESONANCE**
                    - Action: Kinetic energy, chases, fights, explosions. (100=Mad Max)
                    - Fun: Humor, lightheartedness, dopamine inducement. (100=Barbie)
                    - Romance: Love story significance, chemistry, emotional intimacy. (100=The Notebook)
                    - Tension: Suspense, anxiety, nail-biting sequences. (100=Uncut Gems)

                    2. **NARRATIVE STRUCTURE**
                    - Twist: Shock value of plot turns, unpredictability. (100=Sixth Sense)
                    - Complexity: Layered storytelling, requires focus, "brain-bending". (100=Tenet)
                    - Pacing: Speed of plot progression. (0=Slow Burn, 100=Breakneck Speed)
                    - Novelty: Originality, uniqueness of concept. (100=Everything Everywhere All At Once)

                    3. **CONTENT INTENSITY** (Parental Advisory Context)
                    - Gore: Visceral violence, blood, dismemberment. (100=Saw)
                    - Nudity: Sexual content, nudity. (100=Blue is the Warmest Color)
                    - Profanity: Frequency and severity of language. (100=Wolf of Wall Street)
                    - Substance: Drug use, alcohol abuse. (100=Trainspotting)

                    4. **TECHNICAL DIAGNOSTICS**
                    - Cinematography: Visual beauty, color palette, shot composition. (100=Dune)
                    - Score: Impact and memorability of music/soundtrack. (100=Interstellar)
                    - Performance: Acting quality, cast chemistry. (100=The Godfather)
                    - Immersion: World-building, atmosphere, escapism. (100=Avatar)

                    JSON Schema:
                    {{
                        "emotional": {{ "action": Int, "fun": Int, "romance": Int, "tension": Int }},
                        "narrative": {{ "twist": Int, "complexity": Int, "pacing": Int, "novelty": Int }},
                        "content": {{ "gore": Int, "nudity": Int, "profanity": Int, "substance": Int }},
                        "technical": {{ "cinematography": Int, "score": Int, "performance": Int, "immersion": Int }}
                    }}
                    """
                    response = client.models.generate_content(
                        model="gemini-2.5-flash", 
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            safety_settings=safety_config # Apply Safety Config
                        )
                    )
                    if response.text:
                        composition_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                except Exception as e: print(f"AI Error: {e}")
            return build_response(200, composition_data)

        else: return build_response(400, {"error": "Invalid mode"})

    except Exception as e: return build_response(500, {"error": str(e)})

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, OPTIONS" },
        "body": json.dumps(body)
    }