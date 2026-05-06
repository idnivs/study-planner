import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, StyleSheet } from 'react-native';
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
  const { active_trees, toggleTree, countdown_date, countdown_label, setCountdown, load: loadConfig } = useConfigStore();
  const { trees, load: loadTrees } = useTreeStore();
  const { load: loadTasks } = useTaskStore();
  const [cdModal, setCdModal] = useState(false);
  const [cdDate, setCdDate] = useState('');
  const [cdLabel, setCdLabel] = useState('');

  useEffect(() => {
    (async () => {
      await loadConfig();
      const current = useConfigStore.getState().active_trees;
      await loadTrees(current);
    })();
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

  const openCountdown = () => {
    setCdDate(countdown_date || '');
    setCdLabel(countdown_label || '考研倒计时');
    setCdModal(true);
  };

  const saveCountdown = async () => {
    await setCountdown(cdDate.trim(), cdLabel.trim() || '考研倒计时');
    setCdModal(false);
  };

  const clearCountdown = async () => {
    await setCountdown('', '');
    setCdModal(false);
  };

  const cdDisplay = countdown_date
    ? `${countdown_label || '倒计时'}: ${countdown_date}`
    : '设置倒计日期';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>活跃知识树</Text>
        <TreeSelector trees={trees} active={active_trees} onToggle={handleToggleTree} />
      </Card>

      <Pressable style={styles.row} onPress={openCountdown}>
        <Text style={styles.rowText}>⏰ {cdDisplay}</Text>
        <Text style={styles.rowArrow}>›</Text>
      </Pressable>

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

      <Modal visible={cdModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>设置倒计时</Text>
            <Text style={styles.inputLabel}>标签</Text>
            <TextInput
              style={styles.input}
              value={cdLabel}
              onChangeText={setCdLabel}
              placeholder="如：考研倒计时"
              placeholderTextColor={theme.text3}
            />
            <Text style={styles.inputLabel}>目标日期 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={cdDate}
              onChangeText={setCdDate}
              placeholder="如：2026-12-20"
              placeholderTextColor={theme.text3}
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtn} onPress={() => setCdModal(false)}>
                <Text style={styles.modalBtnText}>取消</Text>
              </Pressable>
              {countdown_date ? (
                <Pressable style={styles.modalBtn} onPress={clearCountdown}>
                  <Text style={[styles.modalBtnText, { color: theme.danger }]}>清除</Text>
                </Pressable>
              ) : null}
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveCountdown}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: theme.text2,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.bg,
    borderRadius: theme.radiusSm,
    padding: 12,
    fontSize: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  modalBtnPrimary: {
    backgroundColor: theme.primary,
  },
  modalBtnText: {
    fontSize: 14,
    color: theme.text2,
    fontWeight: '600',
  },
});
