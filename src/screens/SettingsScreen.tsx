import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useConfigStore } from '../stores/useConfigStore';
import { useTreeStore } from '../stores/useTreeStore';
import { useTaskStore } from '../stores/useTaskStore';
import { TreeSelector } from '../components/tree/TreeSelector';
import { Card } from '../components/ui/Card';
import { theme } from '../constants/theme';
import { resetAllProgress } from '../db/repositories/progressRepo';

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const { active_trees, toggleTree, load: loadConfig } = useConfigStore();
  const { trees, load: loadTrees } = useTreeStore();
  const { load: loadTasks } = useTaskStore();

  useEffect(() => {
    loadConfig();
    loadTrees(active_trees);
  }, []);

  const handleToggleTree = async (treeId: string) => {
    await toggleTree(treeId);
    const updated = useConfigStore.getState().active_trees;
    await Promise.all([loadTrees(updated), loadTasks(updated)]);
  };

  const handleReset = () => {
    Alert.alert('确认', '重置全部进度？此操作不可撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '重置', style: 'destructive',
        onPress: async () => {
          await resetAllProgress(active_trees);
          await loadTasks(active_trees);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>活跃知识树</Text>
        <TreeSelector trees={trees} active={active_trees} onToggle={handleToggleTree} />
      </Card>

      <Pressable
        style={styles.row}
        onPress={() => nav.navigate('ApiSettings')}
      >
        <Text style={styles.rowText}>⚙️ API 设置</Text>
        <Text style={styles.rowArrow}>›</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={handleReset}>
        <Text style={[styles.rowText, { color: theme.danger }]}>🔄 重置全部进度</Text>
        <Text style={styles.rowArrow}>›</Text>
      </Pressable>

      <Card style={{ marginTop: 24 }}>
        <Text style={styles.about}>11408 学习计划 v4.0</Text>
        <Text style={styles.aboutSub}>React Native 纯本地版</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  row: {
    backgroundColor: theme.surface,
    borderRadius: theme.radiusSm,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadowStyle,
  },
  rowText: {
    fontSize: 15,
    color: theme.text,
  },
  rowArrow: {
    fontSize: 18,
    color: theme.text3,
  },
  about: {
    fontSize: 13,
    color: theme.text,
    textAlign: 'center',
  },
  aboutSub: {
    fontSize: 11,
    color: theme.text3,
    textAlign: 'center',
    marginTop: 4,
  },
});
