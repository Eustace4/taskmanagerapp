import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, Platform,
  TouchableOpacity, Modal, Pressable
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabaseConfig';

export default function EditTaskScreen({ navigation, route }) {
  const { darkMode } = useContext(ThemeContext);
  const { task } = route.params;

  // Date parsing with safe defaults
  const safeDate = (value, fallback = new Date()) =>
    value ? new Date(value) : fallback;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');

  const [startDate, setStartDate] = useState(safeDate(task?.startTime || task?.startDate));
  const [startTime, setStartTime] = useState(safeDate(task?.startTime));
  const [dueDate, setDueDate] = useState(safeDate(task?.dueTime || task?.dueDate));
  const [dueTime, setDueTime] = useState(safeDate(task?.dueTime));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);

  const mergeDateAndTime = (date, time) => {
    const result = new Date(date);
    result.setHours(time.getHours());
    result.setMinutes(time.getMinutes());
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  };

  const shouldNotify = async (userId) => {
    const { data, error } = await supabase
        .from('settings')
        .select('notification_enabled')
        .eq('id', userId)
        .single();

    return data?.notification_enabled && !error;
    };

  const handleUpdate = async () => {
    const finalStart = mergeDateAndTime(startDate, startTime);
    const finalDue = mergeDateAndTime(dueDate, dueTime);

    if (finalStart < new Date()) {
      Alert.alert('Invalid Start', 'Start time must be in the future.');
      return;
    }

    if (
      dueDate.toDateString() === startDate.toDateString() &&
      finalDue <= finalStart
    ) {
      Alert.alert('Invalid Time', 'Due time must be after start time on the same day.');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          priority,
          startDate: finalStart.toISOString().split('T')[0],
          dueDate: finalDue.toISOString().split('T')[0],
          startTime: finalStart.toISOString(),
          dueTime: finalDue.toISOString(),
        })
        .eq('id', task.id);

      if (error) throw error;

      if (await shouldNotify(userId)) {
        await Notifications.scheduleNotificationAsync({
            content: {
            title: `Upcoming Task: ${title}`,
            body: `Starts at ${finalStart.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })}`,
            },
            trigger: finalStart,
        });
      }

      Alert.alert('Success', 'Task updated ✅');
      navigation.navigate('Tasks', { taskUpdated: true });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: darkMode ? '#fff' : '#000' }]}>Edit Task</Text>

      <TextInput
        style={[styles.input, { backgroundColor: darkMode ? '#222' : '#f2f2f2', color: darkMode ? '#fff' : '#000' }]}
        placeholder="Task title"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { backgroundColor: darkMode ? '#222' : '#f2f2f2', color: darkMode ? '#fff' : '#000' }]}
        placeholder="Description"
        placeholderTextColor={darkMode ? '#aaa' : '#888'}
        value={description}
        onChangeText={setDescription}
      />

      {/* Dates and Times */}
      <View style={styles.row}>
        <Text style={{ color: darkMode ? '#ccc' : '#000' }}>Start Date:</Text>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateBtn}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          display="default"
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <View style={styles.row}>
        <Text style={{ color: darkMode ? '#ccc' : '#000' }}>Due Date:</Text>
        <TouchableOpacity onPress={() => setShowDuePicker(true)}>
          <Text style={styles.dateBtn}>{dueDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>
      {showDuePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          minimumDate={startDate}
          display="default"
          onChange={(_, date) => {
            setShowDuePicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}

      <View style={styles.row}>
        <Text style={{ color: darkMode ? '#ccc' : '#000' }}>Start Time:</Text>
        <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
          <Text style={styles.dateBtn}>
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(_, time) => {
            setShowStartTimePicker(false);
            if (time) setStartTime(time);
          }}
        />
      )}

      <View style={styles.row}>
        <Text style={{ color: darkMode ? '#ccc' : '#000' }}>Due Time:</Text>
        <TouchableOpacity onPress={() => setShowDueTimePicker(true)}>
          <Text style={styles.dateBtn}>
            {dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>
      {showDueTimePicker && (
        <DateTimePicker
          value={dueTime}
          mode="time"
          display="default"
          onChange={(_, time) => {
            setShowDueTimePicker(false);
            if (time) setDueTime(time);
          }}
        />
      )}

      <View style={styles.row}>
        <Text style={{ color: darkMode ? '#ccc' : '#000' }}>Priority:</Text>
        <TouchableOpacity onPress={() => setPriorityModalVisible(true)}>
          <View style={styles.priorityPicker}>
            <Text style={{ color: '#4C9EFF', fontWeight: '500' }}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#4C9EFF" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveBtnText}>Update Task</Text>
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
                    color: priority === option ? '#4C9EFF' : darkMode ? '#fff' : '#000',
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBtn: {
    fontSize: 16,
    color: '#4C9EFF',
    fontWeight: '500',
    paddingVertical: 8,
  },
  priorityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: '#4C9EFF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
