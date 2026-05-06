import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet,
} from 'react-native';
import { theme } from '../../constants/theme';
import { useTaskStore } from '../../stores/useTaskStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { Task } from '../../types/task';

interface ManualTimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ManualTimeModal({ visible, onClose }: ManualTimeModalProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const { recordManual, current } = useTimerStore();
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showTaskList, setShowTaskList] = useState(false);

  // Pre-select current timer task if any
  React.useEffect(() => {
    if (current) {
      const t = tasks.find(t => t.id === current.taskId);
      if (t) {
        setSelectedTask(t);
        setMinutes(String(Math.floor(current.elapsed / 60) || current.estimatedMin));
      }
    }
  }, [visible]);

  const filtered = search
    ? tasks.filter(t => {
        const q = search.toLowerCase();
        return `${t.title} ${t.id} ${t.category}`.toLowerCase().includes(q);
      }).slice(0, 30)
    : tasks.slice(0, 30);

  const handleSave = async () => {
    if (!selectedTask || !minutes.trim()) return;
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    await recordManual(selectedTask.id, selectedTask.tree_id, selectedTask.minutes, mins);
    setSelectedTask(null);
    setMinutes('');
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>手动录入学习时间</Text>

          {/* Task selector */}
          <Text style={styles.label}>任务</Text>
          <Pressable style={styles.selector} onPress={() => setShowTaskList(!showTaskList)}>
            <Text style={selectedTask ? styles.selectedText : styles.placeholder}>
              {selectedTask ? `${selectedTask.id} ${selectedTask.title}` : '选择任务...'}
            </Text>
          </Pressable>

          {showTaskList && (
            <View style={styles.taskListContainer}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="搜索..."
                placeholderTextColor={theme.text3}
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                style={styles.taskList}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.taskItem}
                    onPress={() => { setSelectedTask(item); setShowTaskList(false); setSearch(''); }}
                  >
                    <Text style={styles.taskItemId}>{item.id}</Text>
                    <Text style={styles.taskItemTitle} numberOfLines={1}>{item.title}</Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Minutes */}
          <Text style={styles.label}>学习时长 (分钟)</Text>
          <TextInput
            style={styles.input}
            value={minutes}
            onChangeText={setMinutes}
            placeholder="如：60"
            placeholderTextColor={theme.text3}
            keyboardType="number-pad"
          />

          {/* Date */}
          <Text style={styles.label}>日期</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.text3}
          />

          {/* Buttons */}
          <View style={styles.btns}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>取消</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
              <Text style={[styles.btnText, { color: '#fff' }]}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: theme.text2,
    marginBottom: 6,
    marginTop: 12,
  },
  selector: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  selectedText: {
    fontSize: 14,
    color: theme.text,
  },
  placeholder: {
    fontSize: 14,
    color: theme.text3,
  },
  taskListContainer: {
    marginTop: 4,
    maxHeight: 200,
  },
  searchInput: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 8,
    fontSize: 13,
    color: theme.text,
    marginBottom: 4,
  },
  taskList: {
    maxHeight: 160,
  },
  taskItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  taskItemId: {
    fontSize: 10,
    color: theme.text3,
    fontFamily: 'monospace',
    width: 65,
  },
  taskItemTitle: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },
  input: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    fontSize: 15,
    color: theme.text,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  btnPrimary: {
    backgroundColor: theme.primary,
  },
  btnText: {
    fontSize: 14,
    color: theme.text2,
    fontWeight: '600',
  },
});
