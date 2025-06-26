import React, { useEffect, useState, useContext } from 'react';
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
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TaskListScreen({ route }) {
  const { theme } = useContext(ThemeContext);
  const [tasksForDate, setTasksForDate] = useState([]);
  const [completed, setCompleted] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortPickerVisible, setSortPickerVisible] = useState(false);
  const [sortMethod, setSortMethod] = useState('dueDate');

  const allTasks = [
    {
      id: '1',
      title: 'Study React Native',
      description: 'Finish tutorial and try out FlatList.',
      dueDate: '2024-07-01',
      priority: 'medium',
    },
    {
      id: '2',
      title: 'Fix login bug',
      description: 'Investigate OAuth redirect issue on Android.',
      dueDate: '2024-07-03',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Team call',
      description: 'Discuss app launch plan with design and QA.',
      dueDate: '2024-07-03',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Weekend trip',
      description: 'Book hotel and rental car.',
      dueDate: '2024-07-06',
      priority: 'low',
    },
  ];

  const priorityWeight = { high: 0, medium: 1, low: 2 };

  useEffect(() => {
    const selectedDate = route?.params?.selectedDate;
    if (selectedDate) {
      const filtered = allTasks.filter((task) => task.dueDate === selectedDate);
      setTasksForDate(filtered);
    } else {
      setTasksForDate(allTasks);
    }
  }, [route]);

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
    const diff = due.getTime() - now.getTime();
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

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
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
            <Text style={{ color: theme.text }}>Due: {selectedTask?.dueDate}</Text>
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
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
  },
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
