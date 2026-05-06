import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { theme } from '../../constants/theme';
import { KnowledgeReference } from '../../types/knowledge';

interface ReferencesListProps {
  references: KnowledgeReference[];
  onRemove: (refId: number) => void;
}

export function ReferencesList({ references, onRemove }: ReferencesListProps) {
  const handleLongPress = (ref: KnowledgeReference) => {
    Alert.alert('删除', `确定删除 "${ref.title}"？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onRemove(ref.id) },
    ]);
  };

  if (references.length === 0) {
    return <Text style={styles.empty}>暂无参考资料</Text>;
  }

  return (
    <View>
      {references.map((ref, i) => (
        <Pressable
          key={ref.id || i}
          style={styles.item}
          onLongPress={() => handleLongPress(ref)}
        >
          <Text style={styles.index}>{i + 1}.</Text>
          <View style={styles.content}>
            <Text style={styles.title}>{ref.title}</Text>
            {ref.url ? <Text style={styles.url}>{ref.url}</Text> : null}
            {ref.note ? <Text style={styles.note}>{ref.note}</Text> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: theme.text3,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  index: {
    width: 24,
    fontSize: 13,
    color: theme.text3,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  url: {
    fontSize: 11,
    color: theme.primary,
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: theme.text2,
    marginTop: 2,
  },
});
