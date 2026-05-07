import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { ChatBubble } from '../components/knowledge/ChatBubble';
import { theme } from '../constants/theme';
import { taskManagerChat, TaskAction } from '../services/taskManagerLLM';

export function TaskManagerChatScreen() {
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const activeTrees = useConfigStore((s) => s.active_trees);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setSending(true);

    const newHistory = [...chatHistory, { role: 'user' as const, content: msg }];
    setChatHistory(newHistory);

    try {
      const actions = await taskManagerChat(chatHistory, msg);

      for (const a of actions) {
        if (a.type === 'reply' && a.message) {
          newHistory.push({ role: 'assistant', content: a.message });
        } else if (a.type === 'add_task' && a.title) {
          const treeId = a.tree_id || activeTrees[0] || '11408';
          try {
            const id = await useTaskStore.getState().addCustomTask({
              title: a.title,
              category: a.category || '408',
              module: a.module || '自定义',
              chapter: a.chapter || '自定义',
              minutes: a.minutes || 30,
              priority: a.priority || 5,
              prerequisites: [],
            }, treeId);
            newHistory.push({ role: 'assistant', content: `✅ 已添加任务：${a.title} (ID: ${id})` });
          } catch (e: any) {
            newHistory.push({ role: 'assistant', content: `❌ 添加失败：${e.message}` });
          }
        } else if (a.type === 'delete_task' && a.task_id) {
          const treeId = a.tree_id || activeTrees[0] || '11408';
          try {
            await useTaskStore.getState().deleteCustomTask(a.task_id, treeId);
            newHistory.push({ role: 'assistant', content: `✅ 已删除任务：${a.task_id}` });
          } catch (e: any) {
            newHistory.push({ role: 'assistant', content: `❌ 删除失败：${e.message}` });
          }
        } else if (a.type === 'decompose_task' && a.task_id) {
          const treeId = a.tree_id || activeTrees[0] || '11408';
          try {
            const ids = await useTaskStore.getState().decomposeTask(a.task_id, treeId);
            newHistory.push({ role: 'assistant', content: `✅ 已分解任务 ${a.task_id} 为 ${ids.length} 个子任务` });
          } catch (e: any) {
            newHistory.push({ role: 'assistant', content: `❌ 分解失败：${e.message}` });
          }
        } else if (a.type === 'list') {
          // List is informational — the reply message already contains the list
          if (a.message) {
            newHistory.push({ role: 'assistant', content: a.message });
          }
        }
      }

      setChatHistory([...newHistory]);
    } catch (e: any) {
      newHistory.push({ role: 'assistant', content: `❌ 错误：${e.message}` });
      setChatHistory([...newHistory]);
    }

    setSending(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <FlatList
        ref={flatRef}
        data={chatHistory}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <ChatBubble role={item.role} content={item.content} />
        )}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>💡 任务管理助手</Text>
            <Text style={styles.emptyHint}>通过对话管理你的任务树：</Text>
            <Text style={styles.emptyHint}>- "帮我列一下408的任务"</Text>
            <Text style={styles.emptyHint}>- "添加一个数学题：行列式计算"</Text>
            <Text style={styles.emptyHint}>- "删除这个自定义任务"</Text>
            <Text style={styles.emptyHint}>- "分解任务XXX"</Text>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="告诉AI你想怎么管理任务..."
          placeholderTextColor={theme.text3}
          multiline
          editable={!sending}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendText}>{sending ? '...' : '发送'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  chatList: {
    padding: 12,
    paddingBottom: 16,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 12,
  },
  emptyHint: {
    fontSize: 13,
    color: theme.text2,
    marginBottom: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    backgroundColor: '#f8f9fb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.primary,
  },
  sendDisabled: {
    backgroundColor: theme.border,
  },
  sendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
