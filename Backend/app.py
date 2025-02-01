from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
import speech_recognition as sr
from flask import Flask, request, jsonify
from pydub import AudioSegment
import os
import speech_recognition as sr


CORS(app)  

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/upload', methods=['POST'])
def upload_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'message': 'No audio file part'}), 400

        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        if not audio_file.filename.endswith('.wav'):
            return jsonify({'message': 'Only .wav files are allowed'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
        audio_file.save(filepath)
        
        # Call the analyse_audio function after saving the file
        analyse_audio()
        
        return jsonify({
                'message': 'Audio file uploaded and analyzed successfully!',
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


def analyse_audio():
    
    r=sr.Recognizer()
    print("this function is callled")
    harvad=sr.AudioFile('uploads/Hello here is an acc.wav')
    with harvad as source:
        audio=r.record(source)
    val=r.recognize_google(audio)
    print(val,end='\n')

@app.route('/emergency', methods=['POST'])
def emergency():
    data = request.get_json()

    accident_type = data.get('accident_type')
    number_of_people = data.get('number_of_people')

    print(f"Received emergency data: Accident Type: {accident_type}, Number of People Affected: {number_of_people}")
    return jsonify({"message": "Emergency details received successfully!"}), 200


    
if __name__ == '__main__':
    app.config['DEBUG'] = False
    app.run(host='0.0.0.0', port=5000)
