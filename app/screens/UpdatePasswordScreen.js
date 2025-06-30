import React, { useState, useContext, useEffect } from 'react';
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

export default function UpdatePasswordScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check if user has a valid session (any authenticated session)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Current session:', session); // Debug log
      
      // For testing purposes, we'll allow any session or no session
      // In production, you might want to be more strict
      setSessionChecked(true);
      
      if (!session) {
        console.log('No session found - user can still try to update password');
      } else {
        console.log('Session found:', session.user?.email);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email); // Debug log
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected!');
        setSessionChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigation]);

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Missing Password', 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.log('Password update error:', error);
        throw error;
      }

      Alert.alert(
        'Password Updated',
        'Your password has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      console.log('Update password error:', err);
      Alert.alert('Update Failed', err.message || 'Something went wrong. Make sure you clicked the reset link from your email first.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.header, { color: theme.text }]}>
          Checking session...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.header, { color: theme.text }]}>Set New Password</Text>
      <Text style={[styles.subtext, { color: theme.secondaryText }]}>
        Enter your new password below.
      </Text>

      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
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

      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
        onPress={handleUpdatePassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtext: { fontSize: 14, marginBottom: 24 },
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
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});