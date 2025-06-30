import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { supabase } from '../../constants/supabaseConfig';
import * as Notifications from 'expo-notifications';

export default function LoginScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const askNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Permission Denied', 'You will not receive task reminders.');
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await askNotificationPermission();
      Alert.alert('Welcome!', 'You are now signed in.');
      navigation.replace('Main');
    } catch (err) {
      console.error('Login error:', err.message);
      Alert.alert('Login Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email to reset your password.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      Alert.alert(
        'Reset Email Sent',
        'Check your inbox for a link to reset your password.'
      );
    } catch (err) {
      console.error('Password reset error:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Log In</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#222' : '#f2f2f2',
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={theme.secondaryText}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#222' : '#f2f2f2',
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={theme.secondaryText}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={[
          styles.buttonPrimary,
          { backgroundColor: '#4C9EFF', opacity: loading ? 0.6 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging In...' : 'Log In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={[styles.linkText, { color: '#4C9EFF' }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>
      
      //Add this after your "Forgot Password?" button in LoginScreen.js
      {/*<TouchableOpacity 
        onPress={() => navigation.navigate('UpdatePassword')}
        style={[styles.buttonSecondary, { borderColor: '#FF6B6B', marginTop: 10 }]}
      >
        <Text style={[styles.buttonText, { color: '#FF6B6B' }]}>
         🔧 Test: Update Password
        </Text>
      </TouchableOpacity>*/}


      <View style={styles.footer}>
        <Text style={{ color: theme.secondaryText }}>
          Don’t have an account?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={[styles.buttonSecondary, { borderColor: '#007AFF' }]}
        >
          <Text style={[styles.buttonText, { color: '#007AFF' }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 26, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonPrimary: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondary: {
    width: '60%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 14,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
});
