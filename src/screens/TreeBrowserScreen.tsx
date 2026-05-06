import React, { useEffect, useState } from 'react';
import {
  View, Text, SectionList, Pressable, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { theme } from '../constants/theme';
import { getCatStyle } from '../constants/categories';
import { Task } from '../types/task';

export function TreeBrowserScreen() {
  const nav = useNavigation<any>();
  const { tasks, completed, load } = useTaskStore();
  const { active_trees } = useConfigStore();

  useEffect(() => {
    load(active_trees);
  }, [active_trees]);

  // Build sections: Category → Module → Chapter → Tasks
  const byCat: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!byCat[t.category]) byCat[t.category] = [];
    byCat[t.category].push(t);
  }

  const sections = Object.entries(byCat).map(([cat, catTasks]) => {
    // Group by module + chapter
    const byCh: Record<string, Task[]> = {};
    for (const t of catTasks) {
      const key = `${t.module}|||${t.chapter}`;
      if (!byCh[key]) byCh[key] = [];
      byCh[key].push(t);
    }
    const data = Object.entries(byCh).map(([key, chTasks]) => {
      const [module, chapter] = key.split('|||');
      const done = chTasks.filter(t => completed[t.id]).length;
      return {
        key,
        module,
        chapter,
        done,
        total: chTasks.length,
        tasks: chTasks,
      };
    });
    return { title: cat, data };
  });

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderSectionHeader={({ section }) => {
          const catStyle = getCatStyle(section.title);
          const allDone = section.data.reduce((s, d) => s + d.done, 0);
          const allTotal = section.data.reduce((s, d) => s + d.total, 0);
          return (
            <View style={[styles.catHeader, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catIcon]}>{catStyle.icon}</Text>
              <Text style={[styles.catName, { color: catStyle.color }]}>{section.title}</Text>
              <Text style={styles.catProgress}>
                {allDone}/{allTotal}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <View style={styles.chapterGroup}>
            <View style={styles.chHeader}>
              <Text style={styles.mod}>{item.module}</Text>
              <Text style={styles.modArrow}>›</Text>
              <Text style={styles.ch}>{item.chapter}</Text>
              <Text style={styles.chProgress}>({item.done}/{item.total})</Text>
            </View>
            {item.tasks.map((t) => {
              const done = completed[t.id];
              const unlocked = !done && useTaskStore.getState().isUnlocked(t.id);
              const status = done ? '✓已完成' : unlocked ? '◉可解锁' : '🔒锁定';
              const statusColor = done ? '#bbb' : unlocked ? theme.primary : theme.text3;
              return (
                <Pressable
                  key={t.id}
                  style={styles.taskRow}
                  onPress={() => nav.navigate('TaskDetail', { taskId: t.id, treeId: t.tree_id })}
                >
                  <Text style={styles.taskId}>{t.id}</Text>
                  <Text
                    style={[styles.taskTitle, done && styles.done, !done && !unlocked && styles.locked]}
                    numberOfLines={1}
                  >
                    {t.title}
                  </Text>
                  <Text style={styles.taskMin}>{t.minutes}m</Text>
                  <Text style={[styles.taskStatus, { color: statusColor }]}>{status}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  list: {
    paddingBottom: 40,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  catIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  catName: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  catProgress: {
    fontSize: 13,
    color: theme.text3,
  },
  chapterGroup: {
    backgroundColor: theme.surface,
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: theme.radiusSm,
    padding: 8,
  },
  chHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 4,
  },
  mod: {
    fontSize: 12,
    color: theme.text2,
    fontWeight: '600',
  },
  modArrow: {
    fontSize: 12,
    color: theme.text3,
    marginHorizontal: 4,
  },
  ch: {
    fontSize: 12,
    color: theme.text2,
    fontWeight: '600',
  },
  chProgress: {
    fontSize: 11,
    color: theme.text3,
    marginLeft: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 16,
  },
  taskId: {
    fontSize: 10,
    color: theme.text3,
    width: 58,
    fontFamily: 'monospace',
  },
  taskTitle: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },
  done: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
  locked: {
    color: theme.text3,
  },
  taskMin: {
    fontSize: 11,
    color: theme.text3,
    width: 40,
    textAlign: 'center',
  },
  taskStatus: {
    fontSize: 11,
    width: 65,
    textAlign: 'right',
  },
});
