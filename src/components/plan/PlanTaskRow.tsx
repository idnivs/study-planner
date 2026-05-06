import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { theme } from '../../constants/theme';
import { TaskCheckbox } from '../task/TaskCheckbox';
import { TaskPills } from '../task/TaskPills';
import { TimerWidget } from '../timer/TimerWidget';
import { SwipeableRow } from '../ui/SwipeableRow';
import { TaskActionSheet } from '../task/TaskActionSheet';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PlanTaskRowProps {
  taskId: string;
  treeId: string;
  title: string;
  category: string;
  module: string;
  chapter: string;
  minutes: number;
  adjustedMinutes: number;
  priority: number;
  triggered: boolean;
  completed: boolean;
  decomposable?: boolean;
  isCustom?: boolean;
  treeName?: string;
  multiTree: boolean;
  onToggle: () => void;
  onPress: () => void;
  onDecompose?: () => void;
  onDelete?: () => void;
}

export function PlanTaskRow({
  taskId, treeId, title, category, module, chapter,
  minutes, adjustedMinutes, priority, triggered, completed,
  decomposable, isCustom, treeName, multiTree,
  onToggle, onPress, onDecompose, onDelete,
}: PlanTaskRowProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const actions = [
    { icon: '📋', label: '查看详情', onPress: onPress },
    { icon: '⏱️', label: showTimer ? '隐藏计时' : '开始计时', onPress: () => setShowTimer(!showTimer) },
    ...(decomposable && onDecompose ? [
      { icon: '🧩', label: '分解任务', onPress: onDecompose },
    ] : []),
    ...(isCustom && onDelete ? [
      { icon: '🗑️', label: '删除任务', onPress: onDelete, destructive: true },
    ] : []),
  ];

  return (
    <SwipeableRow onSwipeComplete={handleToggle} completed={completed} onLongPress={() => setMenuVisible(true)}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TaskCheckbox checked={completed} onToggle={handleToggle} />
          <Pressable style={styles.content} onPress={onPress}>
            <Text
              style={[styles.title, completed && styles.titleDone]}
              numberOfLines={2}
            >
              {title}
            </Text>
            <TaskPills
              category={category}
              module={module}
              chapter={chapter}
              minutes={minutes}
              adjustedMinutes={adjustedMinutes}
              priority={priority}
              triggered={triggered}
              treeName={treeName}
              multiTree={multiTree}
            />
          </Pressable>
          <Pressable
            style={styles.timerBtn}
            onPress={() => setShowTimer(!showTimer)}
            hitSlop={8}
          >
            <Text style={styles.timerBtnText}>⏱</Text>
          </Pressable>
        </View>
        {showTimer && (
          <TimerWidget
            taskId={taskId}
            taskTitle={title}
            estimatedMin={adjustedMinutes}
            treeId={treeId}
          />
        )}
        <TaskActionSheet
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          title={title}
          actions={actions}
        />
      </View>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    backgroundColor: theme.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  titleDone: {
    color: theme.text3,
    textDecorationLine: 'line-through',
  },
  timerBtn: {
    padding: 6,
    marginLeft: 4,
  },
  timerBtnText: {
    fontSize: 18,
  },
});
