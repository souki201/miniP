import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore'; // Import Zustand store
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ userToken }) => {
  const { isDarkMode } = useThemeStore(); // Access dark mode state
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState();

  useEffect(() => {
    const initializeSocket = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        const socketInstance = io('http://192.168.1.8:5000', {
          auth: { token: `Bearer ${authToken}` },
        });
        setSocket(socketInstance); // Save the socket instance in state
      }
    };

    initializeSocket();
  }, []);

  useEffect(() => {
    // Fetch all users (excluding self)
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://192.168.1.8:5000/users', {
          headers: { Authorization: `Bearer ${AsyncStorage.getItem('authToken')}` },
        });
        setUsers(response.data.filter((user) => user._id !== selectedUser?.id));
      } catch (error) {
        console.error('Error fetching users:', error.response.data);
      }
    };

    fetchUsers();
  }, [userToken]);

  useEffect(() => {
    if (selectedUser) {
      // Check if the room exists
      const roomId = `${selectedUser._id}`;

      // Fetch chat history or create a new room if it doesn't exist
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://192.168.1.8:5000/messages/${roomId}`,
            { headers: { Authorization: `Bearer ${AsyncStorage.getItem('authToken')}` } }
          );
          setMessages(response.data);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // If room not found, create a new room
            await createNewRoom(roomId);
          } else {
            console.error('Error fetching messages:', error.response.data);
          }
        }
      };

      // Join room with selected user or create new room if doesn't exist
      const createNewRoom = async (roomId) => {
        try {
          await axios.post(
            'http://192.168.1.8:5000/rooms', // Create new room API
            { roomId },
            { headers: { Authorization: `Bearer ${AsyncStorage.getItem('authToken')}` } }
          );
          console.log('Room created successfully');
          socket.emit('joinRoom', { roomId });
        } catch (error) {
          console.error('Error creating room:', error.response?.data);
        }
      };

      fetchMessages();

      // Handle incoming messages
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.emit('leaveRoom', { roomId });
      };
    }
  }, [selectedUser, socket, userToken]);

  const sendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const roomId = `${selectedUser._id}`;
      const messageData = {
        roomId,
        message: newMessage,
      };
      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId: 'You', message: newMessage, timestamp: new Date() },
      ]);
      setNewMessage('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#ffffff' }]}>
      {/* User Selection */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userContainer, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
            onPress={() => setSelectedUser(item)}
          >
            <Text style={[styles.userText, { color: isDarkMode ? '#fff' : '#000' }]}>
              {item.email}
            </Text>
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
                  { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' },
                ]}
              >
                <Text style={[styles.messageText, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {item.userId}: {item.message}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' },
              ]}
              placeholder="Type your message"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <Button
              title="Send"
              onPress={sendMessage}
              color={isDarkMode ? '#6200ea' : '#007bff'} // Button color changes based on dark mode
            />
          </View>
        </>
      )}
    </View>
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
  },
  userContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  userText: {
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 5,
    padding: 10,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
});

export default ChatScreen;
