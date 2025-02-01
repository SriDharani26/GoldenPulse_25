from flask import Flask, request, jsonify
from flask_cors import CORS 
import os
import speech_recognition as sr
from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime
import speech_recognition as sr
import re
import spacy
from pydub import AudioSegment
from severity import severity_bp

load_dotenv()

app = Flask(__name__)
CORS(app)  

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

mongo_connection_string = os.getenv('MONGO_CONNECTION_STRING')
if not mongo_connection_string:
    raise ValueError("No MongoDB connection string found in environment variables")

client = MongoClient(mongo_connection_string)

db = client['Emergency'] 
emergency_collection = db['Records']

@app.route('/upload', methods=['POST'])
def upload_audio():
    try:
        print(request.files['audio'])
        if 'audio' not in request.files:
            return jsonify({'message': 'No audio file part'}), 400

        print('first step')
        audio_file = request.files['audio']
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        
        print(f"Latitude: {latitude}, Longitude: {longitude}")

    
        if audio_file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        print('second step')

        if not audio_file.filename.endswith('.wav'):
            return jsonify({'message': 'Only .wav files are allowed'}), 400

        print('third step')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
        audio_file.save(filepath)

        print('fouth step')
        analyse_audio()
        reporting_time = datetime.utcnow()
        emergency_type, injured_people = analyse_audio()
        emergency_data = {
            'accident_type': emergency_type,
            'number_of_people': injured_people,
            'latitude': latitude,
            'longitude': longitude,
            'reporting_time': reporting_time
        }
        
        emergency_collection.insert_one(emergency_data) 
        
        return jsonify({'message': 'Audio file uploaded successfully!'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

def analyse_audio():
    audio_file = "uploads/audio.wav"
    converted_audio_file = "uploads/converted_audio.wav"

    def convert_to_wav(input_file, output_file):
        """Convert the input audio file to WAV format."""
        try:
            audio = AudioSegment.from_file(input_file)
            audio.export(output_file, format="wav")
            print(f"File converted to WAV: {output_file}")
        except Exception as e:
            print(f"Error converting audio file: {e}")

    def is_wav_format(file_path):
        """Check if the given file is in WAV format."""
        try:
            with open(file_path, "rb") as f:
                header = f.read(4)
                return header == b'RIFF'
        except Exception as e:
            print(f"Error reading file: {e}")
            return False

    if not is_wav_format(audio_file):
        print(f"File is not in WAV format. Converting {audio_file} to WAV...")
        convert_to_wav(audio_file, converted_audio_file)
        audio_file = converted_audio_file  

    def transcribe_audio(file_path):
        """Transcribe audio to text using Google Speech Recognition."""
        try:
            r = sr.Recognizer()
            with sr.AudioFile(file_path) as source:
                audio_data = r.record(source) 
                text = r.recognize_google(audio_data)
                return text
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return None

    def extract_emergency_details(text):
            nlp = spacy.load("en_core_web_sm")
            

    
            fire_keywords = {"fire", "burning", "flames", "smoke"}
            road_accident_keywords = {"road accident", "crash", "collision", "vehicle", "hit"}
            building_collapse_keywords = {"building collapse", "collapsed", "trapped", "structure failure"}
            landslide_keywords = {"landslide", "mudslide", "rockslide"}
            injury_keywords = {"injured", "hurt", "wounded","died","colletral damage","affected","bleeding","severe", "casualties", "trapped", "people", "members"}


            emergency_type = "Unknown"
            injured_people = 0

            
            lower_text = text.lower()

            if any(word in lower_text for word in fire_keywords):
                emergency_type = "Fire"
            elif any(word in lower_text for word in road_accident_keywords):
                emergency_type = "Road Accident"
            elif any(word in lower_text for word in building_collapse_keywords):
                emergency_type = "Building Collapse"
            elif any(word in lower_text for word in landslide_keywords):
                emergency_type = "Landslide"
            else:
                emergency_type = "Unknown"  

            injured_people = 0
            words = text.split()

            for i, word in enumerate(words):
                if word.lower() in injury_keywords:

                    for j in range(max(0, i - 3), min(len(words), i + 3)):
                        if words[j].isdigit():
                            injured_people = int(words[j])
                            break
                    if injured_people > 0:
                        break
                    
            return emergency_type, injured_people

    text = transcribe_audio(audio_file)

    if text:
        print("Transcription successful:")
        print(text)
        emergency_type, injured_people = extract_emergency_details(text)

        if emergency_type:
            print(f"Emergency Type: {emergency_type.capitalize()}")
        else:
            print("Emergency Type: Not detected")

        if injured_people is not None:
            print(f"Number of Injured People: {injured_people}")
        else:
            print("Number of Injured People: Not mentioned")
    else:
        print("Failed to transcribe audio.")
        
    return emergency_type, injured_people



@app.route('/emergency', methods=['POST'])
def emergency():
    data = request.get_json()

    accident_type = data.get('accident_type')
    number_of_people = data.get('number_of_people')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    reporting_time = datetime.utcnow()

    print(f"Received emergency data: Accident Type: {accident_type}, Number of People Affected: {number_of_people},latitude: {latitude}, longitude: {longitude}, Reporting Time: {reporting_time}")

    try:
        emergency_data = {
            'accident_type': accident_type,
            'number_of_people': number_of_people,
            'latitude': latitude,
            'longitude': longitude,
            'Reporting_Time': reporting_time  
        }
        emergency_collection.insert_one(emergency_data) 
        print("Emergency data saved to database.")
        return jsonify({"message": "Emergency details received successfully!"}), 200
    except Exception as e:
        print(f"Error saving data to MongoDB: {e}")
        return jsonify({"message": "Error saving emergency data"}), 500


app.register_blueprint(severity_bp)


if _name_ == '_main_':
    app.config['DEBUG'] = False
    app.run(host='0.0.0.0', port=5000)