import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userAuthService from '../services/userAuth';
import { decryptAndValidateToken } from '@/utils/authUtils';
import Constants from 'expo-constants';
const { SECRET_KEY } = Constants.expoConfig.extra;
interface AuthState {
  isLoggedIn: boolean;
  isValidUser: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setValidUser: (isValid: boolean) => void;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isValidUser: true,
  token: null,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isLoggedIn = !!token;

      set({
        isLoggedIn,
        token,
        isValidUser: true
      });
    } catch (error) {
      console.error('Error initializing auth state:', error);
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await userAuthService.validateUser({ username, password });

      if (response && response.token) {
        await AsyncStorage.setItem('token', response.token);
        console.log('Token received:', response.token);
        const tokenPayload = decryptAndValidateToken(btoa(response.token), SECRET_KEY);
        await AsyncStorage.setItem('userId', String(tokenPayload.userId));
        await AsyncStorage.setItem('userName', tokenPayload.userName);
        await AsyncStorage.setItem('roleId', String(tokenPayload.roleId));
        set({
          isLoggedIn: true,
          token: response.token,
          isValidUser: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async () => {
    await clearAuthData();
    set({
      isLoggedIn: false,
      token: null,
      isValidUser: true
    });
  },

  setValidUser: (isValid: boolean) => {
    set({ isValidUser: isValid });

    if (!isValid) {
      // Trigger logout when user is invalid
      clearAuthData().then(() => {
        set({
          isLoggedIn: false,
          token: null
        });
      });
    }
  },

  clearAuth: async () => {
    await clearAuthData();
    set({
      isLoggedIn: false,
      token: null,
      isValidUser: true
    });
  }
}));

/**
 * Helper function to clear all authentication related data from storage
 */
const clearAuthData = async (): Promise<void> => {
  const keys = ['auth_token', 'isLoggedIn'];

  try {
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
