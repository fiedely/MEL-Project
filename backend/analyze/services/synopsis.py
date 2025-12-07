import json
from google.genai import types

def analyze_synopsis(client, context, season_query, safety_config):
    name = context['name']
    year = context['year']
    search_context = context['search_context']
    genres = context.get('genres_str', 'General') 
    
    synopsis_data = {"full_plot": "Data Restricted.", "detailed_ending": "Redacted."}
    
    try:
        task_target = f"{season_query} of the TV Series '{name}'" if season_query else f"the {search_context} '{name}' ({year})"

        grounding_tool = types.Tool(google_search=types.GoogleSearch())
        
        prompt = f"""
        TASK: Research and document the TRUE plot of {task_target}.
        
        CRITICAL INSTRUCTION: 
        1. Use Google Search to find a detailed plot summary and the specific ending.
        2. Base your narrative *strictly* on verified search results. Do not invent scenes or details.
        3. If the movie is obscure and search results are vague, state "Data Corrupted" rather than hallucinating a plot.
        
        GENRE CONTEXT: {genres}
        
        TONE & STYLE GUIDE:
        - **The Framework:** Use the "Specimen File" headers purely for visual structure.
        - **The Language:** Write in **Plain English**. Be direct, resourceful, engaging, and accessible.
        - **The Vibe:** Write like a best-selling novel summary that want to attract readers.
        - **Avoid:** Do not use overly complex jargon, thesaurus words, or overly clinical terms.

        **GENRE ADAPTATION (Follow Priority Order):**
        1. **IF HORROR, CRIME, or THRILLER:** (Even if Animated)
           -> Tense, atmospheric, and suspenseful. Focus on the threat and psychological pressure.
        2. **IF COMEDY:**
           -> Witty, ironic, and sharp. Highlight the absurdity of the situations.
        3. **IF ACTION, WAR, or WESTERN:**
           -> Kinetic, punchy, and fast-paced. Focus on movement, strategy, and impact.
        4. **IF SCI-FI or MYSTERY:**
           -> Intriguing and analytical. Focus on the puzzle, the concept, or the unknown.
        5. **IF FAMILY, FANTASY, or ANIMATION (Non-Horror):**
           -> Whimsical, warm, and inviting. Focus on wonder, magic, and friendship.
        6. **IF DRAMA or ROMANCE:**
           -> Emotional and character-driven. Focus on relationships and internal struggles.

        --- FORMATTING REQUIREMENTS FOR 'full_plot' ---
        1. METADATA HEADER: Must start exactly with these three lines:
           SPECIMEN FILE: {name.upper()}
           SUBJECT: [Protagonist Name(s)]
           NARRATIVE START: [Date or Initial Setting]
           
        2. NARRATIVE PHASES: Divide the main plot into about 7 clear paragraphs.
        3. PHASE HEADERS: Start every paragraph with a BOLD title followed by a colon.
           (e.g., **Imprisonment Phase:**, **Mad Tea Party:**, **Psychological Break:**, **What Happen Last Year:**, **The Exciting Card Game:**)

        --- FORMATTING REQUIREMENTS FOR 'detailed_ending' ---
        1. CONTENT: Provide the full resolution and final scene. Reveal all spoilers clearly. Explain all plot twists (if any).
        2. STRUCTURE: Divide into about 4 paragraphs.
        3. PHASE HEADERS: Start every paragraph with a BOLD title followed by a colon.
           (e.g., **Final Fight In The Mountain:**, **The Catastrophic Failure No One Expect:**, **They Still Can Live Happily:**, **The Final Sad Goodbye:**, **Science Experiment Gone Wrong:**)

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