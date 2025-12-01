import os
import sys
import json

# 1. Setup paths so we can import the app
sys.path.append('./hello_world')

# 2. Load API Keys from your env.json file manually
with open('env.json', 'r') as f:
    env_vars = json.load(f)
    os.environ['TMDB_API_KEY'] = env_vars['HelloWorldFunction']['TMDB_API_KEY']
    os.environ['OMDB_API_KEY'] = env_vars['HelloWorldFunction']['OMDB_API_KEY']

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