import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { supabase } from '../../constants/supabaseConfig';
import * as Notifications from 'expo-notifications';

export default function SignUpScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
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

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Missing Info', 'All fields are required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { displayName },
        },
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error('Sign-up succeeded but no user returned.');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          displayName,
        });

      if (profileError) throw profileError;
      
      await askNotificationPermission(); 
      Alert.alert('Account Created', `Welcome aboard, ${displayName}!`);
      navigation.replace('Main');
    } catch (err) {
      console.error('Supabase sign-up error:', err.message);
      Alert.alert('Sign-up Failed', err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Create Account</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#222' : '#f2f2f2',
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Full Name"
        placeholderTextColor={theme.secondaryText}
        value={displayName}
        onChangeText={setDisplayName}
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
        placeholder="Email"
        placeholderTextColor={theme.secondaryText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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
        onPress={handleSignUp}
        disabled={loading}
        style={[styles.button, { backgroundColor: '#4C9EFF', opacity: loading ? 0.6 : 1 }]}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Text
        style={[styles.link, { color: '#4C9EFF' }]}
        onPress={() => navigation.navigate('Login')}
      >
        Already have an account? Log In
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 26, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
