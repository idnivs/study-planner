import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface PromptModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  multiline?: boolean;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  visible, title, placeholder, initialValue, multiline, confirmLabel, onConfirm, onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState(initialValue || '');

  const handleOpen = () => setValue(initialValue || '');

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={handleOpen} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={[styles.input, multiline && styles.inputMulti]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={theme.text3}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            autoFocus
          />
          <View style={styles.btns}>
            <Pressable style={styles.btn} onPress={onCancel}>
              <Text style={styles.btnText}>取消</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => { if (value.trim()) onConfirm(value.trim()); }}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>{confirmLabel || '确定'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    fontSize: 15,
    color: theme.text,
  },
  inputMulti: {
    minHeight: 100,
    lineHeight: 22,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  btnPrimary: {
    backgroundColor: theme.primary,
  },
  btnText: {
    fontSize: 14,
    color: theme.text2,
    fontWeight: '600',
  },
});
