import React from 'react';
import { View } from 'react-native';
import { Pill } from '../ui/Pill';
import { theme } from '../../constants/theme';
import { getCatStyle } from '../../constants/categories';

interface TaskPillsProps {
  category: string;
  module: string;
  chapter: string;
  minutes: number;
  adjustedMinutes: number;
  priority: number;
  triggered: boolean;
  treeName?: string;
  multiTree: boolean;
}

export function TaskPills({
  category, module, chapter, minutes, adjustedMinutes, priority, triggered, treeName, multiTree,
}: TaskPillsProps) {
  const catStyle = getCatStyle(category);
  const showAdj = adjustedMinutes !== minutes;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
      {module ? <Pill text={module} small /> : null}
      {chapter ? <Pill text={chapter} small /> : null}
      <Pill
        text={`⏱ ${adjustedMinutes}min${showAdj ? ` (原${minutes})` : ''}`}
        small
      />
      <Pill text={`★ P${priority}`} small />
      {triggered ? (
        <Pill text="📅 每日" color={theme.primary} bg={theme.primaryLight} small />
      ) : null}
      {multiTree && treeName ? (
        <Pill text={treeName} color={theme.text3} small />
      ) : null}
    </View>
  );
}
