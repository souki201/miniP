import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore'; // Import Zustand store
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ userToken }) => {
  const { isDarkMode } = useThemeStore(); // Access dark mode state
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
  const [messages, setMessages] = useState([]); // Chat messages
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null); // Socket instance
  const [userID, setUserID] = useState(null);

  const fadeAnim = useState(new Animated.Value(0))[0]; // For message animation

  useEffect(() => {
    const initializeSocket = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (authToken) {
        const socketInstance = io('http://192.168.1.8:5000', {
          auth: { token: `Bearer ${authToken}` },
        });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('Connected to socket server');
        });

        socketInstance.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        return () => {
          socketInstance.disconnect();
        };
      }
    };

    initializeSocket();
  }, [userToken]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');
        setUserID(userId);
        const response = await axios.get('http://192.168.1.8:5000/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (userId) {
          const filteredUsers = response.data.filter(
            (user) => user._id !== userId
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, [socket]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (selectedUser && socket) {
        try {
          const userId = await AsyncStorage.getItem('userId');
          const roomId = [userId, selectedUser._id].sort().join('-');
          socket.emit('joinRoom', { roomId });

          socket.on('chatHistory', (history) => {
            setMessages(history);
          });

          socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          });

          socket.emit('getChatHistory', { roomId });

          return () => {
            socket.off('chatHistory');
            socket.off('receiveMessage');
          };
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      }
    };

    fetchChatHistory();
  }, [selectedUser, socket]);

  const sendMessage = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (newMessage.trim() && selectedUser && socket && userId) {
        const roomId = [userId, selectedUser._id].sort().join('-');

        const messageData = {
          roomId,
          receiverId: selectedUser._id,
          message: newMessage,
        };

        socket.emit('sendMessage', messageData);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderId: userId,
            receiverId: selectedUser._id,
            message: newMessage,
            timestamp: new Date(),
          },
        ]);

        setNewMessage('');

        // Trigger fade-in animation for new message
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#ffffff' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* User List */}
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userContainer, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
                  onPress={() => setSelectedUser(item)}
                >
                  <Text style={[styles.userText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.email}</Text>
                </TouchableOpacity>
              )}
              ListHeaderComponent={<Text style={styles.header}>Select a user to chat</Text>}
            />

            {/* Chat Window */}
            {selectedUser && (
              <>
                <FlatList
                  data={messages}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.messageContainer,
                        {
                          backgroundColor: item.senderId === userID ? '#6200ea' : '#007bff',
                          alignSelf: item.senderId === userID ? 'flex-end' : 'flex-start',
                        },
                      ]}
                    >
                      <Text style={styles.messageText}>{item.senderId === userID ? 'You' : selectedUser.email.split('@')[0]}: {item.message}</Text>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
        
        {/* Fixed Input and Send Button */}
        <Animated.View style={[styles.inputContainer , , { backgroundColor: isDarkMode ? '#333' : '#fff' } ]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' }]}
            placeholder="Type your message"
            placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#6200ea', // Futuristic purple color for header
  },
  userContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#333',
    elevation: 4,
  },
  userText: {
    fontSize: 16,
    color: '#fff',
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 10,
    borderColor: '#ccc',
  },
  sendButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 25,
  },
  sendText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default ChatScreen;
