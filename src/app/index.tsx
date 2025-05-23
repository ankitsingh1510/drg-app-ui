import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      const success = await login(username, password);
      if (success) {
        router.replace('/drg');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <View className="space-y-4">
        <View className="items-center mb-8">
          <Image 
            source={require('../assets/DrG.png')}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>
        
        {error ? (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        ) : null}
          <View className="space-y-2">
          <Text className="text-gray-600">Username</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View className="space-y-2">
          <Text className="text-gray-600">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          className={`p-4 rounded-lg mt-4 ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">Login</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
