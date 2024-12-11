// ProfileScreen.js
import React from 'react';
import { View, Text, Button, Switch } from 'react-native';
import useThemeStore from '../store/useThemeStore'; // Import Zustand store

const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore(); // Access dark mode state and toggle function

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff', // Change background color based on dark mode
      }}
    >
      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Profile</Text>
      
      <Switch
        value={isDarkMode}
        onValueChange={toggleDarkMode} // Toggle dark mode
      />

      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
        Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}
      </Text>
    </View>
  );
};

export default ProfileScreen;
