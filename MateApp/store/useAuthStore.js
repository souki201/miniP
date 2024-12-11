import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  // Authentication state
  isLoggedIn: false,

  // Check login status
  checkLoginStatus: async () => {
    const token = await AsyncStorage.getItem('authToken');
    set({ isLoggedIn: !!token }); // Set to true if token exists
  },

  // Login method
  login: async (token) => {
    await AsyncStorage.setItem('authToken', token);
    set({ isLoggedIn: true });
  },

  // Logout method
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    set({ isLoggedIn: false });
  },
}));

export default useAuthStore;
