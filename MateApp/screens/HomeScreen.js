import React from 'react';
import { View, Text, Button } from 'react-native';
import useAuthStore from '../store/useAuthStore'; // Import auth store
import useThemeStore from '../store/useThemeStore'; // Import Zustand store

const HomeScreen = ({ navigation }) => {
  const { isLoggedIn, logout } = useAuthStore(); // Access state and logout method from the store

  const handleLogout = async () => {
    await logout(); // Use the store's logout method
    navigation.replace('Auth');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {isLoggedIn ? 'Welcome, User' : 'You are not logged in. Please login first.'}
      </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
