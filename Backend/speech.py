import speech_recognition as sr
from pydub import AudioSegment

# Path to the original audio file
audio_file = "uploads/audio.wav"
converted_audio_file = "uploads/converted_audio.wav"

# Step 1: Convert the audio file to WAV if it's not already in WAV format
def convert_to_wav(input_file, output_file):
    try:
        # Load the file with pydub
        audio = AudioSegment.from_file(input_file)
        # Export it to WAV format
        audio.export(output_file, format="wav")
        print(f"File converted to WAV: {output_file}")
    except Exception as e:
        print(f"Error converting audio file: {e}")

# Check if the file is in WAV format
def is_wav_format(file_path):
    try:
        with open(file_path, "rb") as f:
            # Check for the standard WAV file signature (RIFF)
            header = f.read(4)
            if header == b'RIFF':
                return True
            else:
                return False
    except Exception as e:
        print(f"Error reading file: {e}")
        return False

# Step 2: If the file is not WAV, convert it
if not is_wav_format(audio_file):
    print(f"File is not in WAV format. Converting {audio_file} to WAV...")
    convert_to_wav(audio_file, converted_audio_file)
    audio_file = converted_audio_file  # Update to the converted file

# Step 3: Recognize the speech in the audio file
def transcribe_audio(file_path):
    try:
        r = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            audio_data = r.record(source)  # Capture audio from file
            # Transcribe using Google Web Speech API
            text = r.recognize_google(audio_data)
            return text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

# Step 4: Transcribe the audio to text
text = transcribe_audio(audio_file)

if text:
    print("Transcription successful:")
    print(text)
else:
    print("Failed to transcribe audio.")
