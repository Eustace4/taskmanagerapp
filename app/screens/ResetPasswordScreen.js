import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../constants/supabaseConfig';
import { ThemeContext } from '../../context/ThemeContext';

export default function ResetPasswordScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
  if (!email.trim()) {
    Alert.alert('Missing Email', 'Please enter your email.');
    return;
  }

  try {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://192.168.0.105:8081',
    });
    if (error) throw error;

    Alert.alert(
      'Reset Link Sent',
      'Please check your email to reset your password. Tap the link in the email to return to the app.'
    );

    navigation.navigate('Login');
  } catch (err) {
    Alert.alert('Reset Failed', err.message || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.header, { color: theme.text }]}>Forgot Password?</Text>
      <Text style={[styles.subtext, { color: theme.secondaryText }]}>
        Enter your email below and we'll send you a reset link.
      </Text>

      <TextInput
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#222' : '#f2f2f2',
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholderTextColor={theme.secondaryText}
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: '#4C9EFF', opacity: loading ? 0.6 : 1 },
        ]}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: theme.text }]}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtext: { fontSize: 14, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});