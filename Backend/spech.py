import speech_recognition as sr

recognizer = sr.Recognizer()

audio_file = 'Backend/uploads/audio.wav'

with sr.AudioFile(audio_file) as source:
    audio_data = recognizer.record(source)

try:
    text = recognizer.recognize_google(audio_data)
    print(text)
except sr.UnknownValueError:
    print('Could not understand audio')
except sr.RequestError:
    print('Error with speech recognition service')