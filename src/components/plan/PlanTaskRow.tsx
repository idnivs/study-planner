import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { TaskCheckbox } from '../task/TaskCheckbox';
import { TaskPills } from '../task/TaskPills';
import { TimerWidget } from '../timer/TimerWidget';

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
  treeName?: string;
  multiTree: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export function PlanTaskRow({
  taskId, treeId, title, category, module, chapter,
  minutes, adjustedMinutes, priority, triggered, completed,
  treeName, multiTree, onToggle, onPress,
}: PlanTaskRowProps) {
  const [showTimer, setShowTimer] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TaskCheckbox checked={completed} onToggle={onToggle} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
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
