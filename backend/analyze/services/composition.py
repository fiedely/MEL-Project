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
                safety_settings=safety_config
            )
        )
        if response.text:
            composition_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"Composition Error: {e}")
        
    return composition_data