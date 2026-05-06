import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TimerBanner } from './src/components/timer/TimerBanner';
import { useConfigStore } from './src/stores/useConfigStore';
import { getDatabase } from './src/db/database';
import { theme } from './src/constants/theme';

export default function App() {
  const [dbReady, setDbReady] = React.useState(false);
  const loadConfig = useConfigStore((s) => s.load);

  useEffect(() => {
    (async () => {
      await getDatabase();
      await loadConfig();
      setDbReady(true);
    })();
  }, []);

  if (!dbReady) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <TimerBanner />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
