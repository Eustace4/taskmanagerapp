import * as Notifications from 'expo-notifications';

export const scheduleLocalNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🗓️ Reminder',
      body: "Don't forget to check your tasks today!",
    },
    trigger: { seconds: 5 }, // fire after 5 seconds
  });
};
