import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, TouchableOpacity, Switch } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/useAuthStore'; // Import auth store
import useThemeStore from '../store/useThemeStore'; // Import Zustand store

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
   const { login } = useAuthStore(); // Access the login method from the store
  

  // Handle login and register logic
  const handleLogin = async () => {
    try {
        console.log({email , password})
      const response = await axios.post('http://192.168.1.8:5000/login', { email, password });
      const { token } = response.data;
      console.log('Logged in with token:', token);
      await AsyncStorage.setItem('authToken', token);
      login(token);
    } catch (error) {
        console.log('Login error:', error.message); // Add this line
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
