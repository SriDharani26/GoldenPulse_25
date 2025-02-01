import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import db from "@/api/api";
import * as Location from 'expo-location';

const accidentImages = {
  road: require('@/assets/images/react-logo.png'),
  fire: require('@/assets/images/react-logo.png'),
  pregnancy: require('@/assets/images/react-logo.png'),
  health: require('@/assets/images/react-logo.png'),
};

const numberOfPeopleImages = {
  '0-1': require('@/assets/images/react-logo.png'),
  '1-5': require('@/assets/images/react-logo.png'),
  '5-10': require('@/assets/images/react-logo.png'),
  '10-20': require('@/assets/images/react-logo.png'),
};

export default function ImageEmergency() {
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accidentType, setAccidentType] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState(null);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow the app to use the location services');
        return false;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);

      const response = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (response.length > 0) {
        let item = response[0];
        let address =`${item.name}, ${item.city}, ${item.postalCode}`;
        setDisplayCurrentAddress(address);
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      console.error(error);
      return false;
    }
  };

  const handleSendEmergency = async () => {
    if (!accidentType || !numberOfPeople) {
      Alert.alert('Error', 'Please select both accident type and number of people');
      return;
    }

    const locationFetched = await getCurrentLocation();
    if (!locationFetched) return;

    const data = {
      accident_type: accidentType,
      number_of_people: numberOfPeople,
      latitude: latitude,
      longitude: longitude,
      location_address: displayCurrentAddress,
    };

    try {
      const response = await db.post('/emergency', data, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        Alert.alert('Success', response.data.message || 'Emergency details shared successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send details');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Form</Text>

      {!accidentType && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Select Type of Accident</Text>
          {Object.keys(accidentImages).map((type) => (
            <TouchableOpacity key={type} onPress={() => setAccidentType(type)}>
              <Image source={accidentImages[type]} style={styles.image} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {accidentType && !numberOfPeople && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Select Number of People Affected</Text>
          {Object.keys(numberOfPeopleImages).map((count) => (
            <TouchableOpacity key={count} onPress={() => setNumberOfPeople(count)}>
              <Image source={numberOfPeopleImages[count]} style={styles.image} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {accidentType && numberOfPeople && (
        <TouchableOpacity style={styles.button} onPress={handleSendEmergency}>
          <Text style={styles.buttonText}>Send Emergency</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});