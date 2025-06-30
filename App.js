import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './app/navigation/AppNavigator';

// Configure how notifications behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // 🔔 Show popup banner
    shouldShowList: true,   // 📋 Appear in Notification Center
    shouldPlaySound: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Notifications permission not granted!');
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
