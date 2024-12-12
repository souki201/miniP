import React, { useState, useEffect } from 'react';
import { View, Text, Button, Switch, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import useThemeStore from '../store/useThemeStore'; // Import Zustand store
import axios from 'axios'; // For making API calls
import AsyncStorage from '@react-native-async-storage/async-storage'; // For accessing AsyncStorage
import * as ImagePicker from 'expo-image-picker';
const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore(); // Access dark mode state and toggle function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [img, setImg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null); // To store the userId

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId'); // Fetch userId from AsyncStorage
        if (!storedUserId) {
          Alert.alert('Error', 'User not found');
          return;
        }
        setUserId(storedUserId);

        const token = await AsyncStorage.getItem('authToken'); // Fetch the auth token from AsyncStorage
        if (!token) {
          Alert.alert('Error', 'Token not found');
          return;
        }

        const response = await axios.get('http://192.168.1.8:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { email, password} = response.data; // Destructure user data
        setEmail(email);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means it will run only once when the component mounts

  const handleUpdateProfile = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken'); // Fetch the auth token from AsyncStorage
      if (!token) {
        Alert.alert('Error', 'Token not found');
        setIsLoading(false);
        return;
      }

      const response = await axios.put(
        'http://192.168.1.8:5000/profile',
        { email, password, img },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Profile updated successfully');
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update profile');
      setIsLoading(false);
    }
  };
  const pickImage = async () => {
    // Ask for camera roll permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'You need to enable permission to access the camera roll.');
      return;
    }

    // Launch image picker and get the selected image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImg(result.assets[0].uri); // Set the selected image URI
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff',
      }}
    >
      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Profile</Text>
{/* Circular Profile Image */}
<TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: img || 'https://via.placeholder.com/150' }} // Fallback to placeholder if no image
          style={{
            width: 150,
            height: 150,
            borderRadius: 75, // Circular shape
            borderWidth: 2,
            borderColor: isDarkMode ? '#fff' : '#000',
            marginBottom: 20,
          }}
        />
      </TouchableOpacity>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={{
          height: 40,
          borderColor: isDarkMode ? '#fff' : '#000',
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          color: isDarkMode ? '#fff' : '#000',
          width: '80%',
        }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{
          height: 40,
          borderColor: isDarkMode ? '#fff' : '#000',
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          color: isDarkMode ? '#fff' : '#000',
          width: '80%',
        }}
      />

      <Button
        title={isLoading ? 'Updating...' : 'Update Profile'}
        onPress={handleUpdateProfile}
        disabled={isLoading}
      />

      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
        Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}
      </Text>
    </View>
  );
};

export default ProfileScreen;
