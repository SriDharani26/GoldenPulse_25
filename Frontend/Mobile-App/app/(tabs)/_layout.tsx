import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E3A8A', 
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: theme.colors.secondary,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color="#1E3A8A" />,
        }}
      />
      <Tabs.Screen
        name="images"
        options={{
          title: 'Form',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color="#1E3A8A" />,
        }}
      />
    </Tabs>
  );
}
