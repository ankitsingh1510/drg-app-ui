import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Mock user data
const MOCK_USER = {
  email: 'test@example.com',
  password: 'password123'
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  initialize: async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      set({ isLoggedIn: isLoggedIn === 'true' });
    } catch (error) {
      console.error('Error initializing auth state:', error);
    }
  },
  login: async (email: string, password: string) => {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      set({ isLoggedIn: true });
      return true;
    }
    return false;
  },
  logout: async () => {
    await AsyncStorage.setItem('isLoggedIn', 'false');
    set({ isLoggedIn: false });
  }
}));
