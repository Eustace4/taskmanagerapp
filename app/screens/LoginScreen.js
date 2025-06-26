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

export default function LoginScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }

    if (email === 'demo@taskapp.com' && password === '123456') {
      Alert.alert('Welcome!', 'You are now signed in.');
      navigation.replace('Main');
    } else {
      Alert.alert('Login Error', 'Invalid email or password.');
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
        style={[styles.buttonPrimary, { backgroundColor: '#4C9EFF' }]}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          Alert.alert('Coming Soon', 'Password reset will be available soon.')
        }
      >
        <Text style={[styles.linkText, { color: '#4C9EFF' }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={{ color: theme.secondaryText }}>
          Don't have an account?
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
