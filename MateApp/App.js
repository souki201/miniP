import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
export default function App() {
  useEffect(() => {
    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Show a custom UI update if necessary
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // You can navigate or perform actions when the user taps on the notification
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
