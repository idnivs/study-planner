import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface TaskCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function TaskCheckbox({ checked, onToggle }: TaskCheckboxProps) {
  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked && <Text style={styles.check}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  check: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
