import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface ProgressRingProps {
  pct: number;
  size?: number;
  thickness?: number;
}

export function ProgressRing({ pct, size = 60, thickness = 5 }: ProgressRingProps) {
  const center = size / 2;
  const radius = center - thickness - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(pct, 100) / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.border}
          strokeWidth={thickness}
          fill="none"
        />
        {pct > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.primary}
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        )}
      </Svg>
      <Text style={styles.label}>{Math.round(pct)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.text,
  },
});
