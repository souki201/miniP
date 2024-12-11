import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const useThemeStore = create((set) => ({
  isDarkMode: false, // Initial state
  toggleDarkMode: async () => {
    // Toggle the dark mode state and save it to AsyncStorage
    set((state) => {
      const newMode = !state.isDarkMode;
      AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode));
      console.log('zeutand') // Save to AsyncStorage
      return { isDarkMode: newMode };
    });
  },
  loadTheme: async () => {
    // Load the theme preference from AsyncStorage or system settings
    const savedTheme = await AsyncStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      set({ isDarkMode: JSON.parse(savedTheme) });
    } else {
      const systemTheme = Appearance.getColorScheme(); // Check the system theme
      set({ isDarkMode: systemTheme === 'dark' });
    }
  },
}));

export default useThemeStore;
