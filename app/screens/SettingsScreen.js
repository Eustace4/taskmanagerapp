import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { supabase } from '../../constants/supabaseConfig';
//import { scheduleLocalNotification } from '../lib/notifications';
import * as Notifications from 'expo-notifications';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const askNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'You must allow notifications in system settings to receive task reminders.'
        );
      }
    }
  };

  // Password fields
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const ensureSettingsExist = async (userId) => {
    const { data } = await supabase.from('settings').select('id').eq('id', userId).single();
    if (!data) {
      await supabase.from('settings').insert({
        id: userId,
        notification_enabled: true,
        theme_preference: 'light',
      });
    }
  };

  const ensureProfileExist = async (userId) => {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).single();
    if (!data) {
      await supabase.from('profiles').insert({
        id: userId,
        displayName: 'New User',
      });
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return Alert.alert('Auth Error', error?.message || 'User not found');

      setUserId(user.id);
      setUserEmail(user.email);

      await ensureProfileExist(user.id);
      await ensureSettingsExist(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('displayName')
        .eq('id', user.id)
        .single();
      if (profile) setDisplayName(profile.displayName || '');

      const { data: settings } = await supabase
        .from('settings')
        .select('notification_enabled, theme_preference')
        .eq('id', user.id)
        .single();
      if (settings) {
        setNotifications(settings.notification_enabled ?? true);
        const stored = settings.theme_preference;
        const current = darkMode ? 'dark' : 'light';
        if (stored && stored !== current) toggleDarkMode();
      }
    };

    initialize();
  }, []);

  const saveDisplayName = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ displayName })
      .eq('id', userId);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Name updated');
    setEditingName(false);
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill in all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Mismatch', 'New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Too Short', 'Password must be at least 6 characters.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: oldPassword,
    });

    if (signInError) {
      return Alert.alert('Incorrect Password', 'The current password is incorrect.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
    }
  };

  const toggleNotifications = async (value) => {
    setNotifications(value);

    if (value) {
      await askNotificationPermission();
    }

    const { error } = await supabase
      .from('settings')
      .update({ notification_enabled: value })
      .eq('id', userId);

    if (error) Alert.alert('Error', error.message);
  };


  const toggleThemePreference = async () => {
    toggleDarkMode();
    const newPref = darkMode ? 'light' : 'dark';
    const { error } = await supabase
      .from('settings')
      .update({ theme_preference: newPref })
      .eq('id', userId);
    if (error) Alert.alert('Error updating theme', error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Display Name</Text>
        <View style={styles.nameEditContainer}>
          <TextInput
            value={displayName}
            editable={editingName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={darkMode ? '#888' : '#999'}
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? '#111' : '#f2f2f2',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#333' : '#ccc',
              },
            ]}
          />
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => (editingName ? saveDisplayName() : setEditingName(true))}
          >
            <Text style={styles.editBtnText}>{editingName ? 'Save' : 'Change'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowPasswordFields((prev) => !prev)}
        style={styles.editBtn}
      >
        <Text style={styles.editBtnText}>
          {showPasswordFields ? 'Cancel' : 'Change Password'}
        </Text>
      </TouchableOpacity>

      {showPasswordFields && (
        <View style={{ gap: 12, marginTop: 12 }}>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Current password"
            secureTextEntry
            placeholderTextColor={darkMode ? '#888' : '#999'}
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? '#111' : '#f2f2f2',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#333' : '#ccc',
              },
            ]}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            placeholderTextColor={darkMode ? '#888' : '#999'}
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? '#111' : '#f2f2f2',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#333' : '#ccc',
              },
            ]}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            placeholderTextColor={darkMode ? '#888' : '#999'}
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? '#111' : '#f2f2f2',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#333' : '#ccc',
              },
            ]}
          />
          <TouchableOpacity style={styles.editBtn} onPress={handlePasswordChange}>
            <Text style={styles.editBtnText}>Save Password</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.row}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleThemePreference} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Notifications</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>

      <View style={styles.logoutBtn}>
        <Button title="Log Out" onPress={handleLogout} color="#FF3B30" />
      </View>

      <View style={styles.versionContainer}>
        <Text style={{ color: darkMode ? '#888' : '#444' }}>
          Version {APP_VERSION}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  section: {
    marginBottom: 20,
  },
  nameEditContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  row: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    minHeight: 48,
    marginTop: 8,
  },
  editBtn: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 40,
  },
  versionContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
});
