import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  // Authentication state
  isLoggedIn: false,
  token: null,
  userId: null,

  // Check login status
  checkLoginStatus: async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userId = await AsyncStorage.getItem('userId');
    set({ isLoggedIn: !!token, token, userId }); // Set to true if token exists
  },

  // Login method
  login: async (token, userId) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userId', userId);
    set({ isLoggedIn: true, token, userId });
  },

  // Logout method
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    set({ isLoggedIn: false, token: null, userId: null });
  },
}));

export default useAuthStore;
