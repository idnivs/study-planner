import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, SectionList, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTaskStore } from '../stores/useTaskStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useTreeStore } from '../stores/useTreeStore';
import { SearchBar } from '../components/ui/SearchBar';
import { CategoryProgressCard } from '../components/knowledge/CategoryProgressCard';
import { EmptyState } from '../components/ui/EmptyState';
import { theme } from '../constants/theme';
import { getCatStyle } from '../constants/categories';
import { Task } from '../types/task';
import { calcCategoryPace } from '../utils/paceCalculator';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ViewMode = 'list' | 'tree';

export function KnowledgeScreen() {
  const nav = useNavigation<any>();
  const { tasks, completed, load: loadTasks } = useTaskStore();
  const { active_trees, countdown_date } = useConfigStore();
  const { categories, load: loadTrees } = useTreeStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [mode, setMode] = useState<ViewMode>('list');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTasks(active_trees);
    loadTrees(active_trees);
  }, [active_trees]);

  // ---- List mode data ----
  const catPaces = useMemo(() => {
    const byCat: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!byCat[t.category]) byCat[t.category] = [];
      byCat[t.category].push(t);
    }
    return Object.entries(byCat).map(([cat, catTasks]) => {
      const doneCount = catTasks.filter(t => completed[t.id]).length;
      return { category: cat, pace: calcCategoryPace(catTasks, doneCount, countdown_date || undefined) };
    });
  }, [tasks, completed, countdown_date]);

  // Filtered cat list
  const filteredCats = search
    ? catPaces.filter(c => c.category.toLowerCase().includes(search.toLowerCase()))
    : catPaces;

  // ---- Tree mode data ----
  const treeSections = useMemo(() => {
    const byCat: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (catFilter && t.category !== catFilter) continue;
      if (search) {
        const q = search.toLowerCase();
        const text = `${t.title} ${t.module} ${t.chapter} ${t.id}`.toLowerCase();
        if (!text.includes(q)) continue;
      }
      if (!byCat[t.category]) byCat[t.category] = [];
      byCat[t.category].push(t);
    }
    return Object.entries(byCat).map(([cat, catTasks]) => {
      const doneCount = catTasks.filter(t => completed[t.id]).length;
      const totalCount = catTasks.length;
      return { category: cat, doneCount, totalCount, tasks: catTasks };
    });
  }, [tasks, completed, search, catFilter]);

  const toggleExpand = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleTaskPress = (task: Task) => {
    nav.navigate('TaskDetail', { taskId: task.id, treeId: task.tree_id });
  };

  // ---- Tree helpers ----
  const groupByModule = (ts: Task[]) => {
    const byMod: Record<string, Task[]> = {};
    for (const t of ts) {
      if (!byMod[t.module]) byMod[t.module] = [];
      byMod[t.module].push(t);
    }
    return Object.entries(byMod);
  };

  const groupByChapter = (ts: Task[]) => {
    const byCh: Record<string, Task[]> = {};
    for (const t of ts) {
      if (!byCh[t.chapter]) byCh[t.chapter] = [];
      byCh[t.chapter].push(t);
    }
    return Object.entries(byCh);
  };

  // ---- Render ----
  return (
    <View style={styles.container}>
      {/* Search + Toggle */}
      <View style={styles.topBar}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="搜索任务..." />
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}
            onPress={() => setMode('list')}
          >
            <Text style={[styles.toggleText, mode === 'list' && styles.toggleTextActive]}>列表</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mode === 'tree' && styles.toggleActive]}
            onPress={() => setMode('tree')}
          >
            <Text style={[styles.toggleText, mode === 'tree' && styles.toggleTextActive]}>树状</Text>
          </Pressable>
        </View>
      </View>

      {/* List mode */}
      {mode === 'list' && (
        <FlatList
          data={filteredCats}
          keyExtractor={(item) => item.category}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="📂" message="没有匹配的分类" />}
          renderItem={({ item }) => (
            <CategoryProgressCard
              category={item.category}
              pace={item.pace}
              onPress={() => {
                setCatFilter(item.category);
                setMode('tree');
              }}
            />
          )}
        />
      )}

      {/* Tree mode */}
      {mode === 'tree' && (
        <>
        {catFilter ? (
          <View style={styles.filterBanner}>
            <Text style={styles.filterText}>筛选：{catFilter}</Text>
            <Pressable onPress={() => setCatFilter('')}>
              <Text style={styles.filterClear}>✕</Text>
            </Pressable>
          </View>
        ) : null}
        <SectionList
          sections={treeSections.map(s => ({
            title: s.category,
            data: [{ type: 'cat' as const, category: s.category, doneCount: s.doneCount, totalCount: s.totalCount, tasks: s.tasks }],
          }))}
          keyExtractor={(item, index) => `${item.category}-${index}`}
          contentContainerStyle={styles.treeContent}
          ListEmptyComponent={<EmptyState icon="🌳" message="没有匹配的任务" />}
          renderSectionHeader={({ section }) => (
            <View style={styles.treeCatHeader}>
              <Text style={styles.treeCatIcon}>{getCatStyle(section.title).icon}</Text>
              <Text style={styles.treeCatName}>{section.title}</Text>
              <Text style={styles.treeCatProgress}>
                {section.data[0]?.doneCount}/{section.data[0]?.totalCount}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            if (item.type !== 'cat') return null;
            return (
              <View>
                {groupByModule(item.tasks).map(([mod, modTasks]) => {
                  const modDone = modTasks.filter(t => completed[t.id]).length;
                  const modKey = `${item.category}|mod|${mod}`;
                  const modOpen = expanded.has(modKey);
                  return (
                    <View key={modKey}>
                      <Pressable style={styles.treeMod} onPress={() => toggleExpand(modKey)}>
                        <Text style={styles.treeArrow}>{modOpen ? '▼' : '▶'}</Text>
                        <Text style={styles.treeModName}>{mod || '未分类'}</Text>
                        <Text style={styles.treeModProg}>{modDone}/{modTasks.length}</Text>
                      </Pressable>
                      {modOpen && groupByChapter(modTasks).map(([ch, chTasks]) => {
                        const chDone = chTasks.filter(t => completed[t.id]).length;
                        const chKey = `${item.category}|ch|${mod}|${ch}`;
                        const chOpen = expanded.has(chKey);
                        return (
                          <View key={chKey}>
                            <Pressable style={styles.treeCh} onPress={() => toggleExpand(chKey)}>
                              <Text style={styles.treeArrow}>{chOpen ? '▼' : '▶'}</Text>
                              <Text style={styles.treeChName}>{ch || '未分类'}</Text>
                              <Text style={styles.treeChProg}>{chDone}/{chTasks.length}</Text>
                            </Pressable>
                            {chOpen && chTasks.map(t => {
                              const done = completed[t.id];
                              return (
                                <Pressable
                                  key={t.id}
                                  style={styles.treeTask}
                                  onPress={() => handleTaskPress(t)}
                                >
                                  <Text style={[styles.treeTaskIcon, { color: done ? theme.success : theme.text3 }]}>
                                    {done ? '✓' : '○'}
                                  </Text>
                                  <Text style={[styles.treeTaskTitle, done && styles.taskDone]} numberOfLines={1}>
                                    {t.title}
                                  </Text>
                                  <Text style={styles.treeTaskMin}>{t.minutes}m</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: theme.surface,
    ...theme.shadowStyle,
  },
  toggleText: {
    fontSize: 12,
    color: theme.text2,
  },
  toggleTextActive: {
    color: theme.text,
    fontWeight: '600',
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  filterText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  filterClear: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: 'bold',
    padding: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  treeContent: {
    paddingBottom: 40,
  },
  // Tree styles
  treeCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  treeCatIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  treeCatName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    flex: 1,
  },
  treeCatProgress: {
    fontSize: 12,
    color: theme.text3,
  },
  treeMod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 8,
    backgroundColor: theme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  treeModName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text2,
    flex: 1,
    marginLeft: 6,
  },
  treeModProg: {
    fontSize: 11,
    color: theme.text3,
  },
  treeCh: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 14,
    paddingVertical: 7,
    backgroundColor: theme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  treeChName: {
    fontSize: 12,
    color: theme.text2,
    flex: 1,
    marginLeft: 6,
  },
  treeChProg: {
    fontSize: 11,
    color: theme.text3,
  },
  treeTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 60,
    paddingRight: 14,
    paddingVertical: 7,
    backgroundColor: theme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  treeTaskIcon: {
    fontSize: 12,
    width: 20,
  },
  treeTaskTitle: {
    fontSize: 12,
    color: theme.text,
    flex: 1,
  },
  taskDone: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
  treeTaskMin: {
    fontSize: 10,
    color: theme.text3,
    marginLeft: 6,
  },
  treeArrow: {
    fontSize: 10,
    color: theme.text3,
    width: 16,
  },
});
