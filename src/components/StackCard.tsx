import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/global';

type StackCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

function StackCard({
  label,
  value,
  goal,
  color,
}: StackCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.goal}> {goal}</Text>
    </View>
  );
}

export default memo(StackCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
  },
  label: {
    fontSize: 12,
    color: colors.grey
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
    marginTop: 4,
  },
  goal: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
});
