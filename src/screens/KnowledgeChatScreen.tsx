import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { ChatBubble } from '../components/knowledge/ChatBubble';
import { theme } from '../constants/theme';

type RouteParams = {
  KnowledgeChat: {
    taskId: string;
    treeId: string;
    title: string;
    category: string;
    module: string;
    chapter: string;
  };
};

export function KnowledgeChatScreen() {
  const route = useRoute<RouteProp<RouteParams, 'KnowledgeChat'>>();
  const { taskId, treeId, title, category, module, chapter } = route.params;
  const { chatHistory, sending, load, sendMessage, saveDetail, addReference, removeReference, detail } = useKnowledgeStore();
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    load(taskId, treeId, title, category, module, chapter);
  }, []);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');

    const actions = await sendMessage(msg);

    // Handle non-reply actions
    for (const a of actions) {
      if (a.type === 'update_detail' && a.content) {
        await saveDetail(a.content);
      } else if (a.type === 'add_reference' && a.title) {
        await addReference(a.title, a.url || '', a.note || '');
      } else if (a.type === 'remove_reference' && a.index !== undefined) {
        const refs = useKnowledgeStore.getState().references;
        if (refs[a.index]) {
          await removeReference(refs[a.index].id);
        }
      }
    }
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
            <Text style={styles.emptyText}>💡 开始提问吧！AI 可以帮助你：</Text>
            <Text style={styles.emptyHint}>- 解答知识点疑问</Text>
            <Text style={styles.emptyHint}>- 总结更新知识详情</Text>
            <Text style={styles.emptyHint}>- 推荐参考资料</Text>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="输入问题..."
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
