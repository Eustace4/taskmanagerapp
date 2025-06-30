import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { supabase } from '../../constants/supabaseConfig';

export default function DashboardScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [greeting, setGreeting] = useState('');
  const [firstName, setFirstName] = useState('Friend');
  const [tasksToday, setTasksToday] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [tasks, setTasks] = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    );
  }, []);

  const fetchTasksForToday = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) throw new Error('Not authenticated');

          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('dueDate', todayStr);

          if (error) throw error;

          setTasks(data || []);
          setTasksToday(data?.length || 0);
        } catch (err) {
          console.error('Task fetch error:', err.message);
          setTasks([]);
          setTasksToday(0);
        }
      };

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) throw new Error('User not authenticated');

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('displayName')
            .eq('id', user.id)
            .single();

          if (profileError || !profile) throw new Error('Profile not found');

          const name = profile.displayName?.split(' ')[0];
          setFirstName(name || 'Friend');
        } catch (err) {
          console.error('Profile fetch error:', err.message);
          setFirstName('Friend');
        }
      };
      fetchUserProfile();
      fetchTasksForToday();
    }, [todayStr])
  );
  useEffect(() => {
  const unsubscribe = navigation.addListener('refreshDashboard', () => {
    fetchTasksForToday(); // 🔁 refresh manually if event is fired
  });

  return unsubscribe;
}, [navigation]);


  useEffect(() => {
    const markings = {};
    if (tasks.length > 0) {
      markings[todayStr] = {
        marked: true,
        dots: [{ color: theme.dot }],
      };
    }
    setMarkedDates(markings);
  }, [tasks, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Calendar
        onDayPress={(day) =>
          navigation.navigate('Tasks', { selectedDate: day.dateString })
        }
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
        Today is {new Date().toLocaleDateString()}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Tasks', { selectedDate: todayStr })}
        style={[styles.summaryBox, { borderColor: theme.border }]}
      >
        <Text style={[styles.summary, { color: theme.text }]}>
          {tasksToday === 0
            ? 'You have zero tasks due today 🎉'
            : `You have ${tasksToday} task${tasksToday !== 1 ? 's' : ''} due today`}
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
    marginTop: 16,
  },
  summary: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
});
