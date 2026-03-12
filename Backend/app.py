from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import tempfile
import base64
import os
from dotenv import load_dotenv
import google.generativeai as genai

# -------------------- Load Environment Variables --------------------
load_dotenv()

# -------------------- API Keys --------------------
MURF_API_KEY = os.getenv("MURF_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MURF_API_KEY:
    print("WARNING: MURF_API_KEY is missing!")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is missing!")

if not MURF_API_KEY or not GEMINI_API_KEY:
    raise ValueError("API keys not found. Check Render environment variables.")

print("API keys found. Backend initialized.")

# -------------------- Gemini Setup --------------------
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# -------------------- Prompt Templates --------------------
PROMPTS = {
    "Summary": """
You are a professional tourist guide.
Provide a high-level overview of "{place}" in {language}.

Focus on:
- The historical significance
- Why the place is famous
- Key architectural or cultural highlights

Keep the explanation concise and engaging.
Limit the response to around 200 words.

Respond ONLY in {language}.
""",

    "Detailed": """
You are a professional tourist guide.
Provide a detailed explanation of "{place}" in {language}.

Focus on:
- History and background
- Cultural importance
- Major attractions

Keep it informative and engaging.
Limit the response to around 300 words.

Respond ONLY in {language}.
"""
}

# -------------------- Flask App --------------------
app = Flask(__name__)
# Explicitly allow all origins and headers for CORS
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

# -------------------- Murf Speech Generator --------------------
def generate_speech(text, voice_id, locale):
    temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)

    url = "https://global.api.murf.ai/v1/speech/stream"

    headers = {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "voice_id": voice_id,
        "text": text,
        "multi_native_locale": locale,
        "model": "FALCON",
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "MONO"
    }

    response = requests.post(url, headers=headers, json=data, stream=True)

    if response.status_code == 200:
        with open(temp_file.name, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
    else:
        raise Exception(f"Murf API Error: {response.status_code} - {response.text}")

    return temp_file.name


# -------------------- Gemini Description Generator --------------------
def generate_description(place, answer_type, language):

    prompt = PROMPTS[answer_type].format(
        place=place,
        language=language
    )

    response = model.generate_content(prompt)

    return response.text


# -------------------- API Route --------------------
@app.route("/generate-audio-guide", methods=["POST"])
def generate_audio_guide():

    data = request.json

    place = data.get("place")
    answer_type = data.get("answerType")
    language = data.get("language")
    voice_id = data.get("voiceId")
    locale = data.get("locale")

    if not all([place, answer_type, language, voice_id, locale]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Generate text description
        print(f"Generating description for {place} in {language}...")
        text_description = generate_description(place, answer_type, language)
        print("Description generated successfully.")

        # Generate speech
        print(f"Generating speech with voice {voice_id}...")
        audio_path = generate_speech(text_description, voice_id, locale)
        print("Speech generated successfully.")

        # Convert audio to base64
        with open(audio_path, "rb") as audio_file:
            encoded_audio = base64.b64encode(audio_file.read()).decode("utf-8")

        return jsonify({
            "description": text_description,
            "audioBase64": encoded_audio
        })
    except Exception as e:
        print(f"Error in generate_audio_guide: {str(e)}")
        return jsonify({"error": str(e)}), 500


# -------------------- Health Check Route --------------------
@app.route("/")
def home():
    return jsonify({"message": "Travel Guide Backend Running"})


# -------------------- Run Server --------------------
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )