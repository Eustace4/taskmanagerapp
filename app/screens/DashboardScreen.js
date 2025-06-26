import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Calendar } from 'react-native-calendars';

export default function DashboardScreen({ navigation }) {
  const [greeting, setGreeting] = useState('');
  const [tasksToday, setTasksToday] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const { theme } = useContext(ThemeContext);

  const tasks = [
    { title: 'Study React Native', dueDate: '2024-07-01' },
    { title: 'Fix login bug', dueDate: '2024-07-03' },
    { title: 'Team call', dueDate: '2024-07-03' },
    { title: 'Weekend trip', dueDate: '2024-07-06' },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fullName = 'Chimaobi Uche'; // Replace with Firestore data eventually
    const first = fullName.split(' ')[0];
    setFirstName(first);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const fakeTaskCount = 3;
      setTasksToday(fakeTaskCount);
    }, 500);
  }, []);

  useEffect(() => {
    const markings = {};
    tasks.forEach(task => {
      const date = task.dueDate;
      if (!markings[date]) {
        markings[date] = {
          marked: true,
          dots: [{ color: theme.dot }],
        };
      } else {
        markings[date].dots.push({ color: theme.dot });
      }
    });
    setMarkedDates(markings);
  }, [theme]);

  const todayStr = new Date().toLocaleDateString();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Calendar
        onDayPress={(day) => navigation.navigate('Tasks', { selectedDate: day.dateString })}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          calendarBackground: theme.background,
          dayTextColor: theme.text,
          monthTextColor: theme.text,
          todayTextColor: theme.dot,
          arrowColor: theme.text,
        }}
      />

      <Text style={[styles.title, { color: theme.text }]}>
        {greeting}, {firstName} 👋
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Today is {todayStr}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Tasks')}
        style={[
          styles.summaryBox,
          { borderColor: theme.border },
        ]}
      >
        <Text style={[styles.summary, { color: theme.text }]}>
          You have {tasksToday} task{tasksToday !== 1 ? 's' : ''} due today
        </Text>
        <Text style={{ color: theme.secondaryText }}>Tap to view tasks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  summaryBox: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  summary: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
});
