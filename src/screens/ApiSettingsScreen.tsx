import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { useConfigStore } from '../stores/useConfigStore';
import { Card } from '../components/ui/Card';
import { theme } from '../constants/theme';

const MODELS = [
  { value: 'deepseek-v4-flash', label: 'V4-Flash 快速稳定' },
  { value: 'deepseek-v4-pro', label: 'V4-Pro 强推理' },
];

const THINKING_MODES = [
  { value: 'non-thinking', label: 'non-thinking' },
  { value: 'thinking', label: 'thinking' },
  { value: 'thinking_max', label: 'thinking_max' },
];

export function ApiSettingsScreen() {
  const config = useConfigStore();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config.api_key) setApiKey(config.api_key);
  }, [config.api_key]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('提示', '请输入 API Key');
      return;
    }
    setSaving(true);
    await config.setApiKey(apiKey.trim());
    setSaving(false);
    Alert.alert('成功', 'API 设置已保存');
  };

  const handleTest = async () => {
    try {
      const resp = await fetch('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (resp.ok) {
        Alert.alert('成功', 'API 连接正常');
      } else {
        Alert.alert('失败', `HTTP ${resp.status}`);
      }
    } catch (e: any) {
      Alert.alert('失败', e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.label}>API Key</Text>
        <View style={styles.keyRow}>
          <TextInput
            style={styles.keyInput}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={!showKey}
            placeholder="sk-..."
            placeholderTextColor={theme.text3}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={styles.showBtn}
            onPress={() => setShowKey(!showKey)}
          >
            <Text style={styles.showText}>{showKey ? '隐藏' : '显示'}</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>platform.deepseek.com → API Keys</Text>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.label}>模型</Text>
        {MODELS.map((m) => (
          <Pressable
            key={m.value}
            style={styles.radio}
            onPress={() => config.setModel(m.value)}
          >
            <View style={[styles.radioCircle, config.model === m.value && styles.radioActive]}>
              {config.model === m.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{m.label}</Text>
          </Pressable>
        ))}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.label}>思考模式</Text>
        {THINKING_MODES.map((m) => (
          <Pressable
            key={m.value}
            style={styles.radio}
            onPress={() => config.setThinkingMode(m.value)}
          >
            <View style={[styles.radioCircle, config.thinking_mode === m.value && styles.radioActive]}>
              {config.thinking_mode === m.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{m.label}</Text>
          </Pressable>
        ))}
      </Card>

      <View style={styles.actions}>
        <Pressable style={styles.testBtn} onPress={handleTest}>
          <Text style={styles.testText}>测试连接</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? '保存中...' : '保存设置'}</Text>
        </Pressable>
      </View>
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
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fb',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
  },
  showBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
  },
  showText: {
    fontSize: 13,
    color: theme.primary,
  },
  hint: {
    fontSize: 11,
    color: theme.primary,
    marginTop: 6,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: theme.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radiusSm,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  testText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
