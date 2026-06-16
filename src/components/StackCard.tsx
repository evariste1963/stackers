import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/global';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors: themeColors } = useTheme();
  const s = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={[s.card, { borderLeftColor: color }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, { color }]}>{value}</Text>
      <Text style={s.goal}> {goal}</Text>
    </View>
  );
}

export default memo(StackCard);

function createStyles(c: typeof colors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: c.themeGrey,
      borderRadius: 12,
      padding: 10,
      borderLeftWidth: 3,
    },
    label: {
      fontSize: 12,
      color: c.grey,
    },
    value: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 4,
    },
    goal: {
      fontSize: 12,
      color: c.grey,
      marginTop: 2,
    },
  });
}
