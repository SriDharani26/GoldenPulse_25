#import package
import speech_recognition

#import audio file
audio_file = "uploads/audio.wav"

# initialize the recognizer
sp = speech_recognition.Recognizer()

# open the file
with speech_recognition.AudioFile(audio_file) as source:
    # load audio to memory
    audio_data = sp.record(source)
    # convert speech to text
    text = sp.recognize_google(audio_data)
    print(text)