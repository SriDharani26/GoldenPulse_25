import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import db from "@/api/api";
import axios from 'axios';

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
 
  const [accidentType, setAccidentType] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState(null);

 
  const handleSendEmergency = async () => {
    if (!accidentType || !numberOfPeople) {
      Alert.alert('Error', 'Please select both accident type and number of people');
      return;
    }


    const data = {
      accident_type: accidentType,
      number_of_people: numberOfPeople,
    };

    try {
      const response = await db.post(`/emergency`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;
      if (response.status === 200) {
        Alert.alert('Success', result.message || 'Emergency details shared successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to send details');
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
          <TouchableOpacity onPress={() => setAccidentType('road')}>
            <Image source={accidentImages.road} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAccidentType('fire')}>
            <Image source={accidentImages.fire} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAccidentType('pregnancy')}>
            <Image source={accidentImages.pregnancy} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAccidentType('health')}>
            <Image source={accidentImages.health} style={styles.image} />
          </TouchableOpacity>
        </View>
      )}

      {accidentType && !numberOfPeople && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Select Number of People Affected</Text>
          <TouchableOpacity onPress={() => setNumberOfPeople('0-1')}>
            <Image source={numberOfPeopleImages['0-1']} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNumberOfPeople('1-5')}>
            <Image source={numberOfPeopleImages['1-5']} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNumberOfPeople('5-10')}>
            <Image source={numberOfPeopleImages['5-10']} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNumberOfPeople('10-20')}>
            <Image source={numberOfPeopleImages['10-20']} style={styles.image} />
          </TouchableOpacity>
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
