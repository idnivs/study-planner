import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.container, isUser ? styles.userRow : styles.aiRow]}>
      <Text style={styles.sender}>{isUser ? '🧑 你' : '🤖 AI'}</Text>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  aiRow: {
    alignItems: 'flex-start',
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: theme.primary,
  },
  aiBubble: {
    backgroundColor: '#f0f0f5',
  },
  text: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
});
