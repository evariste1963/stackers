import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/global';

type StackCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

export default function StackCard({
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 14,
    width: '49%',
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 12,
    color: colors.grey
  },
  value: {
    fontSize: 20,
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
