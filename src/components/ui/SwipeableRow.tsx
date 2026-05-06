import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '../../constants/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeComplete: () => void;
  completed: boolean;
  onLongPress?: () => void;
}

export function SwipeableRow({ children, onSwipeComplete, completed, onLongPress }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    return (
      <Pressable
        style={[styles.swipeAction, completed ? styles.swipeUndo : styles.swipeDone]}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipeComplete();
        }}
      >
        <Text style={styles.swipeIcon}>{completed ? '↩' : '✓'}</Text>
        <Text style={styles.swipeLabel}>{completed ? '取消' : '完成'}</Text>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={80}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          swipeableRef.current?.close();
          onSwipeComplete();
        }
      }}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={500}
        style={styles.content}
      >
        {children}
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: theme.surface,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeDone: {
    backgroundColor: theme.success,
  },
  swipeUndo: {
    backgroundColor: theme.warning,
  },
  swipeIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
});
