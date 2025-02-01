import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios'; 

export default function App() {

  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);

  useEffect(() => {


    async function getPermission() {
      await Audio.requestPermissionsAsync().then((permission) => {
        console.log('Permission Granted: ' + permission.granted);
        setAudioPermission(permission.granted)
      }).catch(error => {
        console.log(error);
      });
    }


    getPermission()

    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  async function startRecording() {
    try {
   
      if (audioPermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })
      }

      const newRecording = new Audio.Recording();
      console.log('Starting Recording')
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus('recording');

    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }

  async function stopRecording() {
    try {

      if (recordingStatus === 'recording') {
        console.log('Stopping Recording')
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();

        const fileName = `recording-${Date.now()}.wav`;  
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
        await FileSystem.moveAsync({
          from: recordingUri,
          to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
        });

        const playbackObject = new Audio.Sound();
        await playbackObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
        await playbackObject.playAsync();

        setRecording(null);
        setRecordingStatus('stopped');
        
        return FileSystem.documentDirectory + 'recordings/' + fileName;
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording(recording);
      if (audioUri) {
        console.log('Saved audio file to', audioUri);
        await sendAudioToBackend(audioUri); 
      }
    } else {
      await startRecording();
    }
  }


  async function sendAudioToBackend(audioUri) {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',  
      name: 'audio.wav'   
    });

    try {
      console.log('Sending audio to backend...');
      const response = await axios.post('http://10.11.52.129:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        }
      });

      if (response.status === 200) {
        console.log('Audio uploaded successfully', response.data);
        alert('Audio uploaded successfully!');
      } else {
        console.log('Error uploading audio:', response.data);
        alert('Error uploading audio');
      }
    } catch (error) {
      console.error('Error sending audio: ', error);
      alert('Error sending audio: ' + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleRecordButtonPress}>
        <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      <Text style={styles.recordingStatusText}>{`Recording status: ${recordingStatus}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'red',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  recordingStatusText: {
    marginTop: 16,
  },
});
