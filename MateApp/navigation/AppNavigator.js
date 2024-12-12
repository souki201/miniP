import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import { SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useThemeStore from '../store/useThemeStore'; // Theme Zustand store
import useAuthStore from '../store/useAuthStore'; // Auth Zustand store

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { isDarkMode, loadTheme } = useThemeStore(); // Access theme state
  const { isLoggedIn, checkLoginStatus } = useAuthStore(); // Access auth state

  useEffect(() => {
    // Load theme and check login status when the app starts
    loadTheme();
    checkLoginStatus();
  }, [loadTheme, checkLoginStatus]);

  const renderTabs = () => (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: isDarkMode ? '#121212' : '#ffffff',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: isDarkMode ? '#ffffff' : '#6200ea',
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#666666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chat" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <Stack.Screen
            name="Tabs"
            component={
            //   <SafeAreaView
            //     style={{
            //       flex: 1,
            //       backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff',
            //     }}
            //   >
                renderTabs
            //   </SafeAreaView>
            }
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
