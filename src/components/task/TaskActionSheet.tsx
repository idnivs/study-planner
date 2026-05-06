import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface ActionItem {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface TaskActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
}

export function TaskActionSheet({ visible, onClose, title, actions }: TaskActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <View style={styles.divider} />
          {actions.map((a, i) => (
            <Pressable
              key={i}
              style={styles.actionRow}
              onPress={() => { onClose(); a.onPress(); }}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionLabel, a.destructive && styles.destructive]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
          <View style={styles.divider} />
          <Pressable style={styles.cancelRow} onPress={onClose}>
            <Text style={styles.cancelText}>取消</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  title: {
    fontSize: 14,
    color: theme.text2,
    textAlign: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 16,
    color: theme.text,
  },
  destructive: {
    color: theme.danger,
  },
  cancelRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: theme.text2,
    fontWeight: '600',
  },
});
