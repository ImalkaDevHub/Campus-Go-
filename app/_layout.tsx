import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Global Logout Helper
export const logout = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  } else {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  }
  router.replace('/login');
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Small delay to ensure the root layout is mounted before navigating
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (token) {
        const userDataStr = Platform.OS === 'web' ? localStorage.getItem('userData') : await SecureStore.getItemAsync('userData');
        const user = userDataStr ? JSON.parse(userDataStr) : null;
        
        if (!user) {
          // If token exists but user data is missing, clear token to prevent loop
          if (Platform.OS === 'web') {
            localStorage.removeItem('userToken');
          } else {
            await SecureStore.deleteItemAsync('userToken');
          }
          return;
        }

        const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];

        if (staffRoles.includes(user.role)) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
