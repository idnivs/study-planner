import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, Alert, StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { ReferencesList } from '../components/knowledge/ReferencesList';
import { Card } from '../components/ui/Card';
import { theme } from '../constants/theme';

type RouteParams = {
  KnowledgeDetail: {
    taskId: string;
    treeId: string;
    title: string;
    category: string;
    module: string;
    chapter: string;
  };
};

export function KnowledgeDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'KnowledgeDetail'>>();
  const nav = useNavigation<any>();
  const { taskId, treeId, title, category, module, chapter } = route.params;
  const { detail, references, loading, load, saveDetail, addReference, removeReference } =
    useKnowledgeStore();
  const [editDetail, setEditDetail] = useState('');

  useEffect(() => {
    load(taskId, treeId, title, category, module, chapter);
  }, [taskId, treeId]);

  useEffect(() => {
    setEditDetail(detail);
  }, [detail]);

  const handleSave = async () => {
    await saveDetail(editDetail);
    Alert.alert('成功', '知识详情已保存');
  };

  const handleAddRef = () => {
    Alert.prompt?.('添加参考资料', '标题 *', [
      { text: '取消', style: 'cancel' },
      {
        text: '下一步',
        onPress: async (refTitle?: string) => {
          if (!refTitle?.trim()) return;
          // Simplified: just add with title for now
          await addReference(refTitle.trim(), '', '');
          // Reload
          load(taskId, treeId, title, category, module, chapter);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.breadcrumb}>{category} · {module} · {chapter}</Text>
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 知识详情</Text>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.editor}
          value={editDetail}
          onChangeText={setEditDetail}
          multiline
          textAlignVertical="top"
          placeholder="在此编辑知识详情 (支持 Markdown)..."
          placeholderTextColor={theme.text3}
        />
      </Card>

      <Card style={{ marginTop: 12 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 参考资料</Text>
          <Pressable style={styles.addBtn} onPress={handleAddRef}>
            <Text style={styles.addText}>+ 添加</Text>
          </Pressable>
        </View>
        <ReferencesList
          references={references}
          onRemove={async (refId) => {
            await removeReference(refId);
            load(taskId, treeId, title, category, module, chapter);
          }}
        />
      </Card>

      <Pressable
        style={styles.chatBtn}
        onPress={() => nav.navigate('KnowledgeChat', {
          taskId, treeId, title, category, module, chapter,
        })}
      >
        <Text style={styles.chatBtnText}>💬 AI 答疑</Text>
      </Pressable>

      <View style={{ height: 40 }} />
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
  header: {
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.text,
  },
  breadcrumb: {
    fontSize: 12,
    color: theme.text3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.primary,
  },
  saveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editor: {
    backgroundColor: '#fafbfc',
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    fontSize: 14,
    color: theme.text,
    minHeight: 200,
    lineHeight: 22,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.success,
  },
  addText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatBtn: {
    marginTop: 16,
    backgroundColor: theme.primary,
    borderRadius: theme.radius,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
