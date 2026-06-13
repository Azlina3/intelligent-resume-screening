
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

prompt = 'Hi'
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    print('SUCCESS:', response.text)
except Exception as e:
    print('ERROR:', str(e))

