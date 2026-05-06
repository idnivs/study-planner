import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { TreeMeta } from '../../types/tree';

interface TreeSelectorProps {
  trees: TreeMeta[];
  active: string[];
  onToggle: (treeId: string) => void;
}

export function TreeSelector({ trees, active, onToggle }: TreeSelectorProps) {
  return (
    <View style={styles.container}>
      {trees.map((tree) => {
        const isActive = active.includes(tree.id);
        return (
          <Pressable
            key={tree.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onToggle(tree.id)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {tree.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  text: {
    fontSize: 13,
    color: theme.text2,
  },
  textActive: {
    color: theme.primary,
    fontWeight: '600',
  },
});
