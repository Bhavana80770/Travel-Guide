from flask import Flask, request, jsonify
from google import genai
from flask_cors import CORS
import requests,tempfile , base64 #we use requests to communicate with murf ai 

MURF_API_KEY = "ap2_358c9aca-f7a9-459f-95e0-142253ddd06e"
GEMINI_API_KEY = "AIzaSyBSXDCoyRgCRb3SlcRW8fSmz6m7nfMrytw"


PROMPTS = {
    "Summary": """
You are a professional tourist guide.
Provide a high-level overview of "{place}" in {language}.

Focus on:
- The historical significance
- Why the place is famous
- Key architectural or cultural highlights

Keep the explanation concise, engaging, and easy to follow.
Avoid excessive details and dates.
Limit the response to around 200 words.

Respond ONLY in {language}.""",
    "Detailed": """
You are a professional tourist guide.
Provide a high-level overview of "{place}" in {language}.

Focus on:
- The historical significance
- Why the place is famous
- Key architectural or cultural highlights

Keep the explanation concise, engaging, and easy to follow.
Avoid excessive details and dates.
Limit the response to around 200 words.

Respond ONLY in {language}.
"""
}


app = Flask(__name__)
CORS(app)

client = genai.Client(api_key = GEMINI_API_KEY) #we use client to communicate with gemini

def generate_speech(text,voice_id,locale):
    temp_file = tempfile.NamedTemporaryFile( #to store the audio temporarily whithout any dataloss we use temp_file
        suffix=".mp3",
        delete=False
    )
    url = "https://global.api.murf.ai/v1/speech/stream"
    headers = {
    "api-key": MURF_API_KEY,
    "Content-Type": "application/json"
    }
    data = {
    "voice_id": voice_id,
    "text": text,
    "multi_native_locale":locale,
    "model": "FALCON",
    "format": "MP3",
    "sampleRate": 24000,
    "channelType": "MONO"
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        with open(temp_file.name, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk) # Process chunks in real-time if needed
                # print(f"Received {len(chunk)} bytes")
    else:
        print(f"Error: {response.status_code}")
    return temp_file

def generate_description(place, answer_type, language):
    prompt = PROMPTS[answer_type].format(place=place, language=language)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


@app.route("/generate-audio-guide", methods=["POST"])
def generate_audio_guide():
    data = request.json #here json is a obj not a function
    place = data['place']
    answer_type = data['answerType']
    language = data['language']
    voice_id=data['voiceId']
    locale=data['locale']
    text_description = generate_description(place,answer_type,language)

    audio_path = generate_speech(text_description,voice_id,locale)

    audio_bytes = open(audio_path.name,"rb").read()
    encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "description":text_description,
        "audioBase64":encoded_audio
        } #it automatically converts obj data into json when it goes to frontend


app.run(debug=True)

####################################################
# def generate_speech(text, voice_id, locale):
#     temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)

#     url = "https://global.api.murf.ai/v1/speech/stream"
#     headers = {
#         "api-key": MURF_API_KEY,
#         "Content-Type": "application/json"
#     }

#     data = {
#         "voice_id": voice_id,
#         "text": text,
#         "locale": locale,
#         "model": "FALCON",
#         "format": "MP3",
#         "sampleRate": 24000,
#         "channelType": "MONO"
#     }

#     response = requests.post(url, headers=headers, json=data)

#     if response.status_code == 200:
#         with open(temp_file.name, "wb") as f:
#             for chunk in response.iter_content(chunk_size=1024):
#                 if chunk:
#                     f.write(chunk)
#         print("Audio streaming completed")
#         return temp_file
#     else:
#         print("Murf Error:", response.text)
#         return None
