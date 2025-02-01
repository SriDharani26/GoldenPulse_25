import { Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import db from "@/api/api";
import * as Location from 'expo-location';

export default function App() {
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);

  useEffect(() => {
    async function getPermission() {
      try {
        const permission = await Audio.requestPermissionsAsync();
        console.log('Permission Granted:', permission.granted);
        setAudioPermission(permission.granted);
      } catch (error) {
        console.error('Error requesting audio permission:', error);
      }
    }

    getPermission();
    getCurrentLocation();

    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  async function startRecording() {
    try {
      if (!audioPermission) {
        alert('Audio recording permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      console.log('Starting Recording');
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async function stopRecording() {
    try {
      if (recordingStatus !== 'recording') return;

      console.log('Stopping Recording');
      await recording.stopAndUnloadAsync();
      const recordingUri = recording.getURI();

      const fileName =`recording-${Date.now()}.wav`;
      const targetDirectory = FileSystem.documentDirectory + 'recordings/';
      await FileSystem.makeDirectoryAsync(targetDirectory, { intermediates: true });

      const targetFilePath = targetDirectory + fileName;
      await FileSystem.moveAsync({
        from: recordingUri,
        to: targetFilePath,
      });

      console.log('Audio file saved at:', targetFilePath);

      const playbackObject = new Audio.Sound();
      await playbackObject.loadAsync({ uri: targetFilePath });
      await playbackObject.playAsync();

      setRecording(null);
      setRecordingStatus('stopped');

      return targetFilePath;
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording();
      if (audioUri) {
        console.log('Saved audio file to', audioUri);
        await sendAudioToBackend(audioUri);
      }
    } else {
      await startRecording();
    }
  }

  async function sendAudioToBackend(audioUri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        console.error('Audio file does not exist:', audioUri);
        alert('Error: Audio file not found.');
        return;
      }

      console.log('Sending audio file:', audioUri);

      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'audio.wav',
      });

      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      const response = await db.post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        alert('Audio uploaded successfully!');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Error sending audio: ' + error.message);
    }
  }

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow the app to use location services');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        const response = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        for (let item of response) {
          let address =`${item.name}, ${item.city}, ${item.postalCode}`;
          setDisplayCurrentAddress(address);
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleRecordButtonPress}>
        <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      <Text style={styles.recordingStatusText}>{`Recording status: ${recordingStatus}`}</Text>
      <Text>{latitude}</Text>
      <Text>{longitude}</Text>
      <Text>{displayCurrentAddress}</Text>
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