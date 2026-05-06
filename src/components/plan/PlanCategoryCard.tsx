import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { getCatStyle } from '../../constants/categories';
import { PlanTaskRow } from './PlanTaskRow';
import { EmptyState } from '../ui/EmptyState';
import { PlanItem } from '../../services/planGenerator';
import { Task } from '../../types/task';

interface PlanCategoryCardProps {
  category: string;
  budget: number;
  tasks: PlanItem[];
  allTasks: Task[];
  completed: Record<string, boolean>;
  treeNames: Record<string, string>;
  multiTree: boolean;
  onTaskToggle: (taskId: string, treeId: string, done: boolean) => void;
  onTaskPress: (taskId: string, treeId: string) => void;
  onTaskDecompose?: (taskId: string, treeId: string) => void;
  onTaskDelete?: (taskId: string, treeId: string) => void;
}

export function PlanCategoryCard({
  category, budget, tasks, allTasks, completed,
  treeNames, multiTree, onTaskToggle, onTaskPress,
  onTaskDecompose, onTaskDelete,
}: PlanCategoryCardProps) {
  const catStyle = getCatStyle(category);
  const totalMin = tasks.reduce((s, t) => s + (t._adjusted_minutes || t.minutes), 0);
  const avail = allTasks.filter(t =>
    t.category === category && !completed[t.id]
  ).length;

  return (
    <View style={[styles.card]}>
      <View style={[styles.header, { backgroundColor: catStyle.bg }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.icon]}>{catStyle.icon}</Text>
          <Text style={[styles.catName, { color: catStyle.color }]}>{category}</Text>
        </View>
        <Text style={styles.budget}>
          {totalMin}/{budget} min · 可用 {avail}
        </Text>
      </View>
      <View style={styles.body}>
        {tasks.length === 0 ? (
          <EmptyState
            icon="🎉"
            message={avail === 0 ? '全部完成！太强了！' : '今天没有安排任务'}
          />
        ) : (
          tasks.map((t, i) => (
            <View key={t.id}>
              {i > 0 && <View style={styles.divider} />}
              <PlanTaskRow
                taskId={t.id}
                treeId={t.tree_id}
                title={t.title}
                category={t.category}
                module={t.module}
                chapter={t.chapter}
                minutes={t.minutes}
                adjustedMinutes={t._adjusted_minutes}
                priority={t.priority}
                triggered={t._triggered}
                completed={completed[t.id] || false}
                decomposable={t.decomposable}
                isCustom={t.is_custom}
                treeName={treeNames[t.tree_id]}
                multiTree={multiTree}
                onToggle={() => onTaskToggle(t.id, t.tree_id, !completed[t.id])}
                onPress={() => onTaskPress(t.id, t.tree_id)}
                onDecompose={onTaskDecompose ? () => onTaskDecompose(t.id, t.tree_id) : undefined}
                onDelete={onTaskDelete ? () => onTaskDelete(t.id, t.tree_id) : undefined}
              />
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    marginBottom: 16,
    ...theme.shadowStyle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: theme.radius,
    borderTopRightRadius: theme.radius,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  catName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budget: {
    fontSize: 12,
    color: theme.text3,
  },
  body: {
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 6,
  },
});
