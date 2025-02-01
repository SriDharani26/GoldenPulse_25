import React, { useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import db from '@/api/api';
import * as Location from 'expo-location';

const accidentImages = {
  road: require('@/assets/images/road.jpg'),
  fire: require('@/assets/images/Fire.jpg'),
  landslide: require('@/assets/images/landslide.jpg'),
  building: require('@/assets/images/building.jpg'),
};

const numberOfPeopleImages = {
  '0-1': require('@/assets/images/react-logo.png'),
  '1-5': require('@/assets/images/react-logo.png'),
  '5-10': require('@/assets/images/react-logo.png'),
  '10-20': require('@/assets/images/react-logo.png'),
};

export default function ImageEmergency() {
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading...');
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
        let address = `${item.name}, ${item.city}, ${item.postalCode}`;
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
      latitude,
      longitude,
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
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text variant="headlineSmall" style={{ color: 'black', marginBottom: 20 }}>
        Emergency Form
      </Text>

      {!accidentType && (
        <View>
          <Text variant="titleMedium" style={{ color: 'black', textAlign: 'center', marginBottom: 10 }}>
            Select Type of Accident
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.keys(accidentImages).map((type) => (
              <Card key={type} mode="outlined" style={{ margin: 10 }} onPress={() => setAccidentType(type)}>
                <Card.Cover source={accidentImages[type]} style={{ width: 140, height: 140 }} />
              </Card>
            ))}
          </View>
        </View>
      )}

      {accidentType && !numberOfPeople && (
        <View>
          <Text variant="titleMedium" style={{ color: 'black', textAlign: 'center', marginBottom: 10 }}>
            Select Number of People Affected
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.keys(numberOfPeopleImages).map((count) => (
              <Card key={count} mode="outlined" style={{ margin: 10 }} onPress={() => setNumberOfPeople(count)}>
                <Card.Cover source={numberOfPeopleImages[count]} style={{ width: 140, height: 140 }} />
              </Card>
            ))}
          </View>
        </View>
      )}

      {accidentType && numberOfPeople && (
        <Button mode="contained" buttonColor="#1E3A8A" onPress={handleSendEmergency} style={{ marginTop: 20, width: '80%' }}>
          Send Emergency
        </Button>
      )}
    </View>
  );
}
