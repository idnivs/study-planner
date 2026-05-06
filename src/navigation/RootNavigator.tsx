import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '../screens/TodayScreen';
import { TreeBrowserScreen } from '../screens/TreeBrowserScreen';
import { TaskPoolScreen } from '../screens/TaskPoolScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { KnowledgeDetailScreen } from '../screens/KnowledgeDetailScreen';
import { KnowledgeChatScreen } from '../screens/KnowledgeChatScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ApiSettingsScreen } from '../screens/ApiSettingsScreen';
import { theme } from '../constants/theme';

const Tab = createBottomTabNavigator();
const PlanStack = createNativeStackNavigator();
const TreeStack = createNativeStackNavigator();
const KnowledgeStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: theme.surface },
  headerTintColor: theme.text,
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 16 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: theme.bg },
};

function TabIcon({ emoji, label, focused }: { emoji: string; label?: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {emoji}
    </Text>
  );
}

function PlanStackScreen() {
  return (
    <PlanStack.Navigator screenOptions={screenOptions}>
      <PlanStack.Screen name="Today" component={TodayScreen} options={{ title: '今日计划' }} />
      <PlanStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '任务详情' }} />
    </PlanStack.Navigator>
  );
}

function TreeStackScreen() {
  return (
    <TreeStack.Navigator screenOptions={screenOptions}>
      <TreeStack.Screen name="TreeBrowser" component={TreeBrowserScreen} options={{ title: '知识树' }} />
      <TreeStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '任务详情' }} />
    </TreeStack.Navigator>
  );
}

function KnowledgeStackScreen() {
  return (
    <KnowledgeStack.Navigator screenOptions={screenOptions}>
      <KnowledgeStack.Screen name="TaskPool" component={TaskPoolScreen} options={{ title: '任务池' }} />
      <KnowledgeStack.Screen name="KnowledgeDetail" component={KnowledgeDetailScreen} options={{ title: '知识详情' }} />
      <KnowledgeStack.Screen name="KnowledgeChat" component={KnowledgeChatScreen} options={{ title: 'AI 答疑' }} />
    </KnowledgeStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator screenOptions={screenOptions}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
      <SettingsStack.Screen name="ApiSettings" component={ApiSettingsScreen} options={{ title: 'API 设置' }} />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text3,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="PlanTab"
        component={PlanStackScreen}
        options={{
          tabBarLabel: '今日计划',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TreeTab"
        component={TreeStackScreen}
        options={{
          tabBarLabel: '知识树',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌳" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="KnowledgeTab"
        component={KnowledgeStackScreen}
        options={{
          tabBarLabel: '知识',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          tabBarLabel: '统计',
          headerShown: true,
          headerTitle: '统计',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
