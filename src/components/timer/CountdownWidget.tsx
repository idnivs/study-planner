import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface CountdownWidgetProps {
  targetDate: string; // ISO date string
  label: string;
}

function calcRemaining(target: string): { days: number; hours: number; minutes: number } | null {
  if (!target) return null;
  const now = new Date();
  const end = new Date(target);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export function CountdownWidget({ targetDate, label }: CountdownWidgetProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(targetDate));

  useEffect(() => {
    setRemaining(calcRemaining(targetDate));
    const timer = setInterval(() => {
      setRemaining(calcRemaining(targetDate));
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!remaining) return null;

  const isExpired = remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {isExpired ? (
        <Text style={styles.expired}>已到期</Text>
      ) : (
        <View style={styles.row}>
          <View style={styles.unit}>
            <Text style={styles.number}>{remaining.days}</Text>
            <Text style={styles.unitLabel}>天</Text>
          </View>
          <Text style={styles.sep}>:</Text>
          <View style={styles.unit}>
            <Text style={styles.number}>{String(remaining.hours).padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>时</Text>
          </View>
          <Text style={styles.sep}>:</Text>
          <View style={styles.unit}>
            <Text style={styles.number}>{String(remaining.minutes).padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>分</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.primaryLight,
    borderRadius: theme.radiusSm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    alignItems: 'center',
    minWidth: 36,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 10,
    color: theme.primary,
    opacity: 0.7,
  },
  sep: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  expired: {
    fontSize: 14,
    color: theme.danger,
    fontWeight: '600',
  },
});
