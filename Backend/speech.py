import speech_recognition as sr
from pydub import AudioSegment

audio_file = "uploads/audio.wav"
converted_audio_file = "uploads/converted_audio.wav"

def convert_to_wav(input_file, output_file):
    try:
        audio = AudioSegment.from_file(input_file)
        audio.export(output_file, format="wav")
        print(f"File converted to WAV: {output_file}")
    except Exception as e:
        print(f"Error converting audio file: {e}")

def is_wav_format(file_path):
    try:
        with open(file_path, "rb") as f:
            header = f.read(4)
            if header == b'RIFF':
                return True
            else:
                return False
    except Exception as e:
        print(f"Error reading file: {e}")
        return False

if not is_wav_format(audio_file):
    print(f"File is not in WAV format. Converting {audio_file} to WAV...")
    convert_to_wav(audio_file, converted_audio_file)
    audio_file = converted_audio_file  

def transcribe_audio(file_path):
    try:
        r = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            audio_data = r.record(source) 
            text = r.recognize_google(audio_data)
            return text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

text = transcribe_audio(audio_file)

if text:
    print("Transcription successful:")
    print(text)
else:
    print("Failed to transcribe audio.")
