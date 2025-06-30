import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabaseConfig';
import * as Notifications from 'expo-notifications';

export default function AddTaskScreen({ navigation }) {
  const { darkMode } = useContext(ThemeContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());

  const mergeDateAndTime = (date, time) => {
    const merged = new Date(date);
    merged.setHours(time.getHours());
    merged.setMinutes(time.getMinutes());
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    return merged;
  };
  const shouldNotify = async (userId) => {
    const { data, error } = await supabase
      .from('settings')
      .select('notification_enabled')
      .eq('id', userId)
      .single();

    return data?.notification_enabled && !error;
  };


  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title before saving.');
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('User not authenticated');

      const finalStartTime = mergeDateAndTime(startDate, startTime);
      const finalDueTime = mergeDateAndTime(dueDate, dueTime);

      if (finalDueTime <= finalStartTime) {
        Alert.alert('Invalid Time', 'Due time must be after start time.');
        return;
      }

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title,
        description,
        priority,
        startDate: startDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        startTime: finalStartTime.toISOString(),
        dueTime: finalDueTime.toISOString(),
      });

      if (error) throw error;

      // 🔧 TEMP: Local notification test
     const testTrigger = new Date(Date.now() + 60 * 1000); // 1 minute from now

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Test Task',
            body: `${title || 'Untitled Task'} is starting now!`,
          },
          trigger: {
            type: 'date',
            date: testTrigger,
          },
        });

        console.log('✅ Notification test scheduled:', testTrigger.toLocaleString());
        Alert.alert('Scheduled', `Notification will fire at ${testTrigger.toLocaleTimeString()}`);
      } catch (err) {
        console.error('❌ Notification error:', err.message);
        Alert.alert('Error', err.message);
      }




      // Reset state (optional since we’re navigating away)
      setTitle('');
      setDescription('');
      setStartDate(new Date());
      setDueDate(new Date());
      setPriority('medium');
      setStartTime(new Date());
      setDueTime(new Date());
    } catch (err) {
      console.error('Task creation error:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: darkMode ? '#fff' : '#000' }]}>
        Add New Task
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? '#222' : '#f2f2f2',
            color: darkMode ? '#fff' : '#000',
            borderColor: darkMode ? '#444' : '#ccc',
          },
        ]}
        placeholder="Task title"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? '#222' : '#f2f2f2',
            color: darkMode ? '#fff' : '#000',
            borderColor: darkMode ? '#444' : '#ccc',
          },
        ]}
        placeholder="Description (optional)"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.dateRow}>
        <Text style={{ color: darkMode ? '#ddd' : '#000' }}>Start Date:</Text>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={[styles.dateBtn, { color: '#007AFF' }]}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            minimumDate={new Date()} // 👈 prevents selecting past days
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.dateRow}>
        <Text style={{ color: darkMode ? '#ddd' : '#000' }}>Due Date:</Text>
        <TouchableOpacity onPress={() => setShowDuePicker(true)}>
          <Text style={[styles.dateBtn, { color: '#007AFF' }]}>{dueDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDuePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            minimumDate={startDate}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selectedDate) => {
              setShowDuePicker(false);
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}
      </View>
      <View style={styles.dateRow}>
  <Text style={{ color: darkMode ? '#ddd' : '#000' }}>Start Time:</Text>
  <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
    <Text style={[styles.dateBtn, { color: '#007AFF' }]}>
      {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </TouchableOpacity>
</View>

{showStartTimePicker && (
  <DateTimePicker
    value={startTime}
    mode="time"
    is24Hour={false}
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={(_, selectedTime) => {
      setShowStartTimePicker(false);
      if (selectedTime) setStartTime(selectedTime);
    }}
  />
)}

<View style={styles.dateRow}>
  <Text style={{ color: darkMode ? '#ddd' : '#000' }}>Due Time:</Text>
  <TouchableOpacity onPress={() => setShowDueTimePicker(true)}>
    <Text style={[styles.dateBtn, { color: '#007AFF' }]}>
      {dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </TouchableOpacity>
</View>

{showDueTimePicker && (
  <DateTimePicker
    value={dueTime}
    mode="time"
    is24Hour={false}
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={(_, selectedTime) => {
      setShowDueTimePicker(false);
      if (selectedTime) setDueTime(selectedTime);
    }}
  />
)}


      <View style={styles.dateRow}>
        <Text style={{ color: darkMode ? '#ddd' : '#000' }}>Priority:</Text>
        <TouchableOpacity onPress={() => setPriorityModalVisible(true)}>
          <View style={styles.priorityPicker}>
            <Text style={{ color: '#007AFF' }}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#007AFF" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      

      <Modal visible={priorityModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPriorityModalVisible(false)}>
          <View style={[styles.priorityModal, { backgroundColor: darkMode ? '#111' : '#fff' }]}>
            {['high', 'medium', 'low'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setPriority(option);
                  setPriorityModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: priority === option ? '#007AFF' : darkMode ? '#fff' : '#000',
                    fontSize: 16,
                    paddingVertical: 10,
                    fontWeight: priority === option ? 'bold' : 'normal',
                  }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBtn: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 8,
  },
  priorityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityModal: {
    width: 200,
    borderRadius: 10,
    padding: 16,
  },
});
