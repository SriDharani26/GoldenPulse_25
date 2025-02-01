import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function ReportPage() {
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Report Patient Condition</Text>

      <TextInput
        label="Condition (e.g., Cardiac Arrest)"
        value={condition}
        onChangeText={setCondition}
        mode="outlined"
        style={{ marginBottom: 10 }}
      />
      
      <TextInput
        label="Additional Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={{ marginBottom: 10 }}
      />

      <Button mode="contained" buttonColor="#1E3A8A" textColor="white">
        Submit Report
      </Button>
    </ScrollView>
  );
}
