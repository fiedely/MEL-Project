import json
from google import genai
from google.genai import types

def analyze_score(client, context, safety_config):
    name = context['name']
    year = context['year']
    
    lab_data = {"popcorn_score": "N/A"}
    
    try:
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
                safety_settings=safety_config
            )
        )
        if response.text:
            lab_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"Score Error: {e}")
        
    return lab_data