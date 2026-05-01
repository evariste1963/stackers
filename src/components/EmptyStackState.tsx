import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/global';

export default function EmptyStackState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stack is Empty</Text>
      <Text style={styles.subtitle}>Add items to start tracking your collection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
  },
});
