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

if not MURF_API_KEY or not GEMINI_API_KEY:
    print("CRITICAL ERROR: API keys missing. Check Render Env Vars.")
else:
    print("API keys found. Proceeding with initialization.")

# -------------------- Gemini Setup --------------------
genai.configure(api_key=GEMINI_API_KEY)

# --- STARTUP CHECK: List Available Models ---
print("--- STARTUP: Available Gemini Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"AVAILABLE MODEL: {m.name}")
except Exception as e:
    print(f"STARTUP ERROR: Could not list models: {str(e)}")
print("--- STARTUP END ---")

# -------------------- Prompt Templates --------------------
PROMPTS = {
    "Summary": "Provide a high-level overview of \"{place}\" in {language}. Historical significance, why famous, key highlights. Concise, engaging, ~200 words. Respond ONLY in {language}.",
    "Detailed": "Provide a detailed explanation of \"{place}\" in {language}. History, cultural importance, major attractions. Informative, engaging, ~300 words. Respond ONLY in {language}."
}

# -------------------- Flask App --------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

@app.route("/")
def home():
    return jsonify({
        "message": "Travel Guide Backend v4 - Running",
        "gemini_api_key_set": bool(GEMINI_API_KEY),
        "murf_api_key_set": bool(MURF_API_KEY)
    })

@app.route("/debug-models")
def debug_models():
    try:
        models = [{"name": m.name, "methods": m.supported_generation_methods} for m in genai.list_models()]
        return jsonify({"available_models": models, "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

# -------------------- Murf Speech Generator --------------------
def generate_speech(text, voice_id, locale):
    temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    url = "https://global.api.murf.ai/v1/speech/stream"
    headers = {"api-key": MURF_API_KEY, "Content-Type": "application/json"}
    data = {
        "voice_id": voice_id, "text": text, "multi_native_locale": locale,
        "model": "FALCON", "format": "MP3", "sampleRate": 24000, "channelType": "MONO"
    }
    response = requests.post(url, headers=headers, json=data, stream=True)
    if response.status_code == 200:
        with open(temp_file.name, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk: f.write(chunk)
    else:
        raise Exception(f"Murf API Error: {response.status_code} - {response.text}")
    return temp_file.name

# -------------------- Gemini Description Generator --------------------
def generate_description(place, answer_type, language):
    prompt = PROMPTS[answer_type].format(place=place, language=language)
    
    # Try multiple variations and prefixes
    models_to_try = [
        "gemini-1.5-flash", 
        "gemini-1.5-flash-latest", 
        "models/gemini-1.5-flash", 
        "models/gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "models/gemini-1.5-pro",
        "gemini-pro"
    ]
    
    last_err = None
    for model_name in models_to_try:
        try:
            print(f"Attempting model: {model_name}")
            current_model = genai.GenerativeModel(model_name)
            response = current_model.generate_content(prompt)
            print(f"SUCCESS with {model_name}")
            return response.text
        except Exception as e:
            print(f"FAILED {model_name}: {str(e)}")
            last_err = e
            continue
    
    raise last_err

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
        print(f"Processing: {place} ({language})")
        text_description = generate_description(place, answer_type, language)
        audio_path = generate_speech(text_description, voice_id, locale)
        with open(audio_path, "rb") as audio_file:
            encoded_audio = base64.b64encode(audio_file.read()).decode("utf-8")

        return jsonify({"description": text_description, "audioBase64": encoded_audio})
    except Exception as e:
        print(f"FULL ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)