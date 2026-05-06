import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { SearchBar } from '../components/ui/SearchBar';
import { Pill } from '../components/ui/Pill';
import { EmptyState } from '../components/ui/EmptyState';
import { theme } from '../constants/theme';
import { getCatStyle } from '../constants/categories';
import { Task } from '../types/task';

type FilterStatus = '全部' | '可解锁' | '锁定' | '已完成';

export function TaskPoolScreen() {
  const nav = useNavigation<any>();
  const { tasks, completed, load } = useTaskStore();
  const { active_trees } = useConfigStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('全部');

  useEffect(() => {
    load(active_trees);
  }, [active_trees]);

  const categories = ['全部', ...new Set(tasks.map(t => t.category))];

  let filtered = tasks.filter(t => {
    if (catFilter !== '全部' && t.category !== catFilter) return false;
    const done = completed[t.id];
    const unlocked = !done && useTaskStore.getState().isUnlocked(t.id);
    if (statusFilter === '已完成' && !done) return false;
    if (statusFilter === '可解锁' && (done || !unlocked)) return false;
    if (statusFilter === '锁定' && (done || unlocked)) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = `${t.title} ${t.module} ${t.chapter} ${t.id}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="搜索任务..." />
      <View style={styles.filters}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.filterChip, catFilter === item && styles.filterChipActive]}
              onPress={() => setCatFilter(item)}
            >
              <Text style={[styles.filterText, catFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </Pressable>
          )}
          style={styles.filterRow}
        />
        <View style={styles.statusFilters}>
          {(['全部', '可解锁', '锁定', '已完成'] as FilterStatus[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.statusChip, statusFilter === s && styles.statusChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.statusText, statusFilter === s && styles.statusTextActive]}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const done = completed[item.id];
          const unlocked = !done && useTaskStore.getState().isUnlocked(item.id);
          const status = done ? '✓已完成' : unlocked ? '◉可解锁' : '🔒锁定';
          const statusColor = done ? '#bbb' : unlocked ? theme.primary : theme.text3;
          const catStyle = getCatStyle(item.category);
          return (
            <Pressable
              style={styles.taskRow}
              onPress={() => nav.navigate('KnowledgeDetail', {
                taskId: item.id,
                treeId: item.tree_id,
                title: item.title,
                category: item.category,
                module: item.module,
                chapter: item.chapter,
              })}
            >
              <View style={styles.taskLeft}>
                <Text style={styles.taskId}>{item.id}</Text>
                <Text style={[styles.taskTitle, done && styles.doneText]} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.taskRight}>
                <Pill text={item.category} color={catStyle.color} bg={catStyle.bg} small />
                <Text style={styles.taskMin}>{item.minutes}m</Text>
                <Text style={styles.taskPri}>P{item.priority}</Text>
                <Text style={[styles.taskStatus, { color: statusColor }]}>{status}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon="🔍" message="没有匹配的任务" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    padding: 12,
  },
  filters: {
    marginVertical: 10,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.primaryLight,
  },
  filterText: {
    fontSize: 12,
    color: theme.text2,
  },
  filterTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  statusChipActive: {
    backgroundColor: theme.primaryLight,
  },
  statusText: {
    fontSize: 11,
    color: theme.text3,
  },
  statusTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  taskRow: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusSm,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskId: {
    fontSize: 10,
    color: theme.text3,
    fontFamily: 'monospace',
    width: 60,
  },
  taskTitle: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },
  doneText: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMin: {
    fontSize: 11,
    color: theme.text3,
  },
  taskPri: {
    fontSize: 11,
    color: theme.text2,
  },
  taskStatus: {
    fontSize: 11,
    width: 65,
    textAlign: 'right',
  },
});
