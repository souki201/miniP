import PushNotification from 'react-native-push-notification';

// Configure push notification
PushNotification.configure({
  // Called when a remote or local notification is opened or received
  onNotification: function(notification) {
    console.log('NOTIFICATION:', notification);
    
    // You can add your custom logic to handle notifications here.
    // For example, navigating to a specific screen:
    // if (notification.userInteraction) {
    //   navigation.navigate('ChatScreen');
    // }
  },

  // Request permissions for iOS (this will be automatically handled on Android)
  requestPermissions: true,

  // You can also configure other settings like channelId, sounds, etc.
  popInitialNotification: true,
  onAction: function (action) {
    console.log("Notification action:", action);
  },

  // Optional: Configure notification channels for Android
  // channelId: 'your-channel-id',
});