import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import useAuthStore from '../store/useAuthStore'; // Import auth store
import useThemeStore from '../store/useThemeStore'; // Import Zustand store
import { Ionicons } from '@expo/vector-icons'; // For adding futuristic icons
import { Switch } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const { isLoggedIn, logout } = useAuthStore(); // Access state and logout method from the store
  const { isDarkMode, toggleDarkMode } = useThemeStore(); // Access dark mode state and toggle function

  const handleLogout = async () => {
    await logout(); // Use the store's logout method
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
      <View style={styles.topRightContainer}>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode} // Toggle dark mode
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      <View style={styles.greetingContainer}>
        <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>
          {isLoggedIn ? 'Welcome, User' : 'You are not logged in. Please login first.'}
        </Text>
      </View>

      {isLoggedIn && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)', // Gradient background
  },
  darkBackground: {
    backgroundColor: '#111', // Dark background for dark mode
  },
  topRightContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1, // Ensure the button stays on top
  },
  greetingContainer: {
    marginBottom: 30,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase', // Futuristic uppercase text
  },
  darkText: {
    color: '#f4f3f4', // Lighter text color for dark mode
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2575fc', // Futuristic blue button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    elevation: 5,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    shadowOpacity: 0.5,
  },
  logoutText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default HomeScreen;
