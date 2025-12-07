import json
from google.genai import types

def analyze_synopsis(client, context, season_query, safety_config):
    name = context['name']
    year = context['year']
    search_context = context['search_context']
    # Extract genres to guide the AI's tone
    genres = context.get('genres_str', 'General') 
    
    synopsis_data = {"full_plot": "Data Restricted.", "detailed_ending": "Redacted."}
    
    try:
        task_target = f"{season_query} of the TV Series '{name}'" if season_query else f"the {search_context} '{name}' ({year})"
        
        # [REFINED PROMPT v4] 
        # - Dynamic Tone: Adapts based on the 'genres' variable.
        # - Comedy -> Witty/Ironic "Archivist"
        # - Horror -> Clinical/Unsettling "Archivist"
        # - Action -> Kinetic/Punchy "Archivist"
        prompt = f"""
        TASK: Construct a "Declassified Specimen File" for {task_target}.
        GENRE CONTEXT: {genres}
        
        TONE & STYLE GUIDE:
        - **The Framework:** STRICTLY maintain the rigid laboratory dossier structure (Headers, Phases).
        - **The Voice:** Act as a "Genre-Savvy Archivist". The "Specimen File" format is the container, but the writing style inside must match the genre:
          - **IF COMEDY:** Use dry wit, irony, and observational humor. Treat absurd situations with deadpan seriousness.
          - **IF HORROR/THRILLER:** Be cold, unsettling, and clinically detailed about the terror.
          - **IF ACTION:** Use punchy, dynamic language to describe kinetic events and strategy.
          - **IF DRAMA/ROMANCE:** Focus on psychological depth, emotional causality, and relationship dynamics.
        - **Reference:** Use Character Names instead of "The Subject".

        --- FORMATTING REQUIREMENTS FOR 'full_plot' ---
        1. METADATA HEADER: Must start exactly with these three lines:
           SPECIMEN FILE: {name.upper()}
           SUBJECT: [Protagonist Name(s)]
           NARRATIVE START: [Date or Initial Setting]
           
        2. NARRATIVE PHASES: Divide the main plot into 5-7 rich, substantial paragraphs.
        3. PHASE HEADERS: Start every paragraph with a short, BOLD, UPPERCASE title followed by a colon. 
           (e.g., **THE INCITING INCIDENT:**, **COMEDIC ESCALATION:**, **THE HUNT:**)

        --- FORMATTING REQUIREMENTS FOR 'detailed_ending' ---
        1. CONTENT: Provide the full resolution, emotional climax, and final scene description. Do not hold back spoilers.
        2. STRUCTURE: Divide into 3-5 paragraphs.
        3. PHASE HEADERS: Start every paragraph with a BOLD, UPPERCASE title.
           (e.g., **FINAL REVELATION:**, **THE PUNCHLINE:**, **FILE CLOSED:**)

        JSON Schema: {{ "full_plot": "String", "detailed_ending": "String" }}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                safety_settings=safety_config
            )
        )
        
        if response.text:
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            synopsis_data = json.loads(cleaned_text)
            
    except Exception as e:
        print(f"Synopsis Error: {e}")
        
    return synopsis_data