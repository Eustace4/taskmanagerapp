import React, { useContext, useEffect, useRef } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import TabNavigator from './TabNavigator';
import { ThemeContext } from '../../context/ThemeContext';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';
import { supabase } from '../../constants/supabaseConfig';
import EditTaskScreen from '../screens/EditTaskScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { darkMode } = useContext(ThemeContext);
  const navigationRef = useRef();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      console.log('Session:', session);
      
      if (event === 'PASSWORD_RECOVERY' && navigationRef.current) {
        navigationRef.current.navigate('UpdatePassword');
      }
    });

    // Handle deep links for password recovery
    const handleDeepLink = async (url) => {
      console.log('Deep link received:', url);
      
      if (url.includes('#access_token=') || url.includes('type=recovery')) {
        try {
          // Extract tokens from URL
          const urlObj = new URL(url);
          const fragment = urlObj.hash.substring(1);
          const params = new URLSearchParams(fragment);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session in Supabase
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (!error && navigationRef.current) {
              navigationRef.current.navigate('UpdatePassword');
            }
          }
        } catch (error) {
          console.error('Error handling password recovery link:', error);
        }
      }
    };

    // Listen for deep links
    const subscription2 = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.unsubscribe();
      subscription2?.remove();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={darkMode ? DarkTheme : DefaultTheme}
    >
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen 
          name="UpdatePassword" 
          component={UpdatePasswordScreen} 
          options={{ title: 'Update Password', headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}