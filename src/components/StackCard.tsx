import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#0d0d0d',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 14,
    color: '#B8860B',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B8860B',
    marginTop: 4,
  },
  goal: {
    fontSize: 14,
    color: '#B8860B',
    marginTop: 2,
  },
});
