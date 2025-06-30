import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabaseConfig';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';


export default function TaskListScreen({ route }) {
  const { theme } = useContext(ThemeContext);
  const [tasksForDate, setTasksForDate] = useState([]);
  const [completed, setCompleted] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortPickerVisible, setSortPickerVisible] = useState(false);
  const [sortMethod, setSortMethod] = useState('dueDate');

  const priorityWeight = { high: 0, medium: 1, low: 2 };

  const fetchTasksFromSupabase = async () => {
    try {
      const selectedDate = route?.params?.selectedDate;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('User not authenticated');

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (selectedDate) {
        query = query.eq('dueDate', selectedDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTasksForDate(data || []);
    } catch (err) {
      console.error('Task fetch error:', err.message);
      Alert.alert('Error loading tasks', err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasksFromSupabase();
    }, [route?.params?.selectedDate])
  );

  const navigation = useNavigation(); // 👈 this gives you the navigation object

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    const routes = navigation.getState().routes;
    const dashboardRoute = routes.find(r => r.name === 'DashboardScreen');

    if (dashboardRoute) {
      navigation.dispatch({
        ...navigation.navigate('DashboardScreen', { refresh: true }),
      });
    }
  });

  return unsubscribe;
}, [navigation]);
  

  const toggleComplete = (id) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const calculateTimeLeft = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diff = due - now;
    if (diff <= 0) return 'Overdue';
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    if (years >= 1) return `Due in ${years} year${years > 1 ? 's' : ''}`;
    if (days >= 1) return `Due in ${days} day${days > 1 ? 's' : ''}`;
    if (hours >= 1) return `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
    return `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  

  const sortedTasks = [...tasksForDate].sort((a, b) => {
    const aDone = completed[a.id];
    const bDone = completed[b.id];
    if (aDone !== bDone) return aDone ? 1 : -1;

    if (sortMethod === 'priority') {
      const aPriority = priorityWeight[a.priority] ?? 99;
      const bPriority = priorityWeight[b.priority] ?? 99;
      return aPriority - bPriority;
    }

    if (sortMethod === 'title') {
      return a.title.localeCompare(b.title);
    }

    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const handleDelete = async () => {
  Alert.alert('Delete Task', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', selectedTask.id);

        if (error) {
          Alert.alert('Error deleting task', error.message);
          return;
        }

        setTasksForDate((prev) => prev.filter((t) => t.id !== selectedTask.id));
        setModalVisible(false);
      },
    },
  ]);
};


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        {route?.params?.selectedDate
          ? `Tasks for ${route.params.selectedDate}`
          : 'All Tasks'}
      </Text>

      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: theme.secondaryText }]}>Sort by:</Text>
        <TouchableOpacity onPress={() => setSortPickerVisible(true)}>
          <Ionicons name="chevron-down" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isDone = completed[item.id];
          const { label: timeLeft, isOverdue } = calculateTimeLeft(item.dueTime || item.dueDate);

          return (
            <View style={[styles.taskBox, { borderColor: theme.border }]}>
              <View style={styles.taskRow}>
                <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isDone ? theme.dot : 'transparent',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {isDone && <Text style={{ color: '#fff' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openTaskDetails(item)} style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      {
                        color: isDone ? theme.secondaryText : theme.text,
                        textDecorationLine: isDone ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ color: theme.secondaryText }}>{item.dueDate}</Text>
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditTask', { task: item })}
                    style={{ marginTop: 6 }}
                  >
                    <Text style={{ color: '#4C9EFF', fontWeight: '500' }}>Edit Task</Text>
                  </TouchableOpacity>

                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Task Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.background }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedTask?.title}
            </Text>
            <Text style={{ color: theme.secondaryText, marginBottom: 10 }}>
              {selectedTask?.description}
            </Text>
           <Text style={{ color: theme.text, marginTop: 8 }}>
              Starts:{' '}
              {selectedTask?.startTime || selectedTask?.startDate
                ? new Date(selectedTask.startTime || selectedTask.startDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  }) +
                  ' at ' +
                  new Date(selectedTask.startTime || selectedTask.startDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </Text>

            <Text style={{ color: theme.text }}>
              Due:{' '}
              {selectedTask?.dueTime || selectedTask?.dueDate
                ? new Date(selectedTask.dueTime || selectedTask.dueDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  }) +
                  ' at ' +
                  new Date(selectedTask.dueTime || selectedTask.dueDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </Text>


            <Text style={{ color: theme.text }}>
              Priority: {selectedTask?.priority?.toUpperCase()}
            </Text>
            <Text style={{ color: theme.dot, marginTop: 6, fontWeight: '600' }}>
              {selectedTask?.dueDate && calculateTimeLeft(selectedTask.dueDate)}
            </Text>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort Picker Modal */}
      <Modal visible={sortPickerVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSortPickerVisible(false)}>
          <View style={[styles.optionBox, { backgroundColor: theme.background }]}>
            {['dueDate', 'priority', 'title'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortMethod(option);
                  setSortPickerVisible(false);
                }}
              >
                <Text
                  style={{
                    color: sortMethod === option ? theme.dot : theme.text,
                    fontWeight: sortMethod === option ? 'bold' : 'normal',
                    paddingVertical: 10,
                    fontSize: 16,
                  }}
                >
                  {option === 'dueDate' ? 'Due Date' : option.charAt(0).toUpperCase() + option.slice(1)}
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
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortLabel: { fontSize: 14 },
  taskBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionBox: {
    marginHorizontal: 40,
    marginTop: '50%',
    borderRadius: 8,
    padding: 16,
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
