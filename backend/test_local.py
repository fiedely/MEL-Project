import os
import sys
import json

# 1. Setup paths so we can import the app
sys.path.append('./search')

# 2. Load API Keys from your env.json file manually
with open('env.json', 'r') as f:
    env_vars = json.load(f)
    # Note: You might need to check if your env.json structure still references 'HelloWorldFunction'
    # AWS SAM usually uses the Logical ID from template.yaml (MelSearchFunction), 
    # but for this manual script, just ensure the keys are loaded.
    # If your env.json still says "HelloWorldFunction", keep it as is, or rename it in env.json too.
    # Assuming standard env.json structure:
    if 'MelSearchFunction' in env_vars:
        func_env = env_vars['MelSearchFunction']
    elif 'HelloWorldFunction' in env_vars:
        func_env = env_vars['HelloWorldFunction']
    else:
        # Fallback if keys are top level or strict structure needed
        func_env = env_vars.get('MelSearchFunction', {})

    os.environ['TMDB_API_KEY'] = func_env.get('TMDB_API_KEY', '')
    os.environ['OMDB_API_KEY'] = func_env.get('OMDB_API_KEY', '')

# 3. Import your Lambda function
from app import lambda_handler

# 4. Create the fake "Event" (What happens when a user searches)
fake_event = {
    "queryStringParameters": {
        "title": "Nightmare Before Christmas" # <--- Change this to test different movies
    }
}

# 5. Run the function!
print("--- STARTING LAB EXPERIMENT ---")
response = lambda_handler(fake_event, None)

print("\n--- STATUS CODE ---")
print(response['statusCode'])

print("\n--- RESULT BODY ---")
# Pretty print the JSON result
print(json.dumps(json.loads(response['body']), indent=4))