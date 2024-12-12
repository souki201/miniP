import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, TouchableOpacity, Switch } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/useAuthStore'; // Import auth store
import useThemeStore from '../store/useThemeStore'; // Import Zustand store
import * as Notifications from 'expo-notifications'; // Import expo-notifications
const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
   const { login } = useAuthStore(); // Access the login method from the store
  

   const handleLogin = async () => {
    try {
      console.log({ email, password });
  
      // Request permission to send notifications
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Permission status:', status);
  
      if (status !== 'granted') {
        console.log('Notification permission not granted!');
        setErrorMessage('Permission to receive notifications is required');
        return;
      }
  
      // Manually set the projectId for bare workflow
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        experienceId: '@mahdisouk/mahdisouki', // Use your experience ID if on managed workflow
        projectId: '78db6917-0eb4-43cb-869b-335dcb18e90b',  // Specify the projectId here
      });
      console.log('Expo Push Token:', expoPushToken);
  
      const response = await axios.post('http://192.168.1.8:5000/login', {
        email,
        password,
        expoPushToken: expoPushToken.data, // Send token to the server
      });
  
      const { token, userId } = response.data; // Extract userId from response
      console.log('Logged in with token:', token, 'and userId:', userId);
      login(token, userId); // Use store's login function
  
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };
  

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://192.168.1.8:5000/register', { email, password });
      console.log('User registered successfully!');
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  const themeStyles = isDarkMode
    ? { backgroundColor: '#1c1c1c', textColor: '#ffffff', inputBackground: '#333333' }
    : { backgroundColor: '#ffffff', textColor: '#000000', inputBackground: '#f5f5f5' };

  return (
    <SafeAreaView style={tailwind`flex-1`}>
      <View style={[tailwind`flex-1 w-full items-center justify-center`, { backgroundColor: themeStyles.backgroundColor }]}>
        <View style={tailwind`px-4 w-full max-w-sm`}>
          <Text style={[tailwind`text-5xl font-bold mb-6`, { color: themeStyles.textColor }]}>
            {isCreatingAccount ? 'Create Account' : 'Login'}
          </Text>

          {errorMessage ? (
            <Text style={tailwind`text-red-500 text-center mb-4`}>{errorMessage}</Text>
          ) : null}

          <View style={tailwind`flex flex-col gap-4`}>
            <TextInput
              placeholder="Enter email address"
              style={[
                tailwind`p-2 border border-gray-400 rounded-md`,
                { backgroundColor: themeStyles.inputBackground, color: themeStyles.textColor },
              ]}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Enter password"
              secureTextEntry
              style={[
                tailwind`p-2 border border-gray-400 rounded-md`,
                { backgroundColor: themeStyles.inputBackground, color: themeStyles.textColor },
              ]}
              value={password}
              onChangeText={setPassword}
            />

            {isCreatingAccount && (
              <TextInput
                placeholder="Confirm password"
                secureTextEntry
                style={[
                  tailwind`p-2 border border-gray-400 rounded-md`,
                  { backgroundColor: themeStyles.inputBackground, color: themeStyles.textColor },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}
          </View>

          {isCreatingAccount ? (
            <TouchableOpacity
              onPress={handleRegister}
              style={[
                tailwind`p-3 rounded-md border mt-6`,
                { backgroundColor: isDarkMode ? '#4caf50' : '#8bc34a' },
              ]}
            >
              <Text style={tailwind`text-white text-center font-semibold`}>
                Register
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleLogin}
              style={[
                tailwind`p-3 rounded-md border mt-6`,
                { backgroundColor: isDarkMode ? '#2196f3' : '#3f51b5' },
              ]}
            >
              <Text style={tailwind`text-white text-center font-semibold`}>
                Login
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsCreatingAccount(!isCreatingAccount)}
            style={tailwind`mt-4`}
          >
            <Text
              style={[
                tailwind`text-center font-semibold`,
                { color: isDarkMode ? '#e0e0e0' : '#3f3f3f' },
              ]}
            >
              {isCreatingAccount ? 'Already have an account? Login' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Dark Mode Toggle */}
          <View style={tailwind`mt-6`}>
            <Text style={[{ color: themeStyles.textColor }, tailwind`mb-2`]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
