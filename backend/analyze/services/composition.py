import json
from google.genai import types

def analyze_composition(client, context, safety_config):
    name = context['name']
    year = context['year']
    search_context = context['search_context']
    genres_str = context['genres_str']
    
    composition_data = {}
    
    try:
        prompt = f"""
        TASK: Act as a Senior Film Pathologist. Analyze the {search_context}: "{name}" ({year}). Genres: {genres_str}.
        Estimate the INTENSITY level (0-100) for these 16 specific attributes based on content analysis.
        
        DEFINITIONS FOR SCORING (0=None, 100=Extreme/Maximum):
        
        1. **EMOTIONAL EXPERIENCE**
        - Thrill: Excitement, adrenaline, kinetic energy, fast pacing. (Action/Adventure focus)
        - Glee: Amusement, humor, delight, laughter, fun. (Comedy focus)
        - Love: Romance, emotional intensity, chemistry, longing, deep connection. (Romance/Drama focus)
        - Terror: Fear, suspense, dread, shock value. (Horror/Thriller focus)

        2. **NARRATIVE STRUCTURE**
        - Twist: Shock value of plot turns, unpredictability.
        - Complexity: Layered storytelling, requires focus.
        - Pacing: Speed of plot progression.
        - Novelty: Originality, uniqueness of concept.

        3. **CONTENT INTENSITY** (Parental Advisory)
        - Gore: Visceral violence, blood.
        - Nudity: Sexual content, nudity.
        - Profanity: Frequency/severity of language.
        - Substance: Drug/alcohol use.

        4. **TECHNICAL DIAGNOSTICS**
        - Cinematography: Visual beauty, shot composition.
        - Score: Impact of music/soundtrack.
        - Performance: Acting quality, cast chemistry.
        - Immersion: World-building, atmosphere.

        JSON Schema:
        {{
            "emotional": {{ "thrill": Int, "glee": Int, "love": Int, "terror": Int }},
            "narrative": {{ "twist": Int, "complexity": Int, "pacing": Int, "novelty": Int }},
            "content": {{ "gore": Int, "nudity": Int, "profanity": Int, "substance": Int }},
            "technical": {{ "cinematography": Int, "score": Int, "performance": Int, "immersion": Int }}
        }}
        """
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                safety_settings=safety_config
            )
        )
        if response.text:
            composition_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"Composition Error: {e}")
        
    return composition_data