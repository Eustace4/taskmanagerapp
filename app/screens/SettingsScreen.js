import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState('Chimaobi');
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleSaveName = () => {
    console.log('Updated name:', displayName);
    // Save name to Firestore here
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <View style={styles.nameRow}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Name</Text>
        <View style={styles.nameEditContainer}>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            editable={isEditing}
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? '#111' : '#f2f2f2',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? '#333' : '#ccc',
              },
            ]}
            placeholder="Your name"
            placeholderTextColor={darkMode ? '#888' : '#999'}
          />
          <TouchableOpacity
            onPress={() => {
              if (isEditing) handleSaveName();
              setIsEditing(!isEditing);
            }}
          >
            <Text style={[styles.link, { color: '#007AFF' }]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: darkMode ? '#fff' : '#000' }]}>Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
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
  nameRow: {
    marginBottom: 18,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  row: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  link: {
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
  },
  versionContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
});
