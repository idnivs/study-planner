import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface PillProps {
  text: string;
  color?: string;
  bg?: string;
  small?: boolean;
}

export function Pill({ text, color = theme.text2, bg = '#f3f4f6', small }: PillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.text, { color }, small && styles.smallText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 2,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
  smallText: {
    fontSize: 9,
  },
});
