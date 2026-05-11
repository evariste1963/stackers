import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles/global';
import { router } from 'expo-router';

interface EmptyStackStateProps {
  title?: string;
  subtitle?: string;
}

export default function EmptyStackState({
  title = 'Your Stack is Empty',
  subtitle = 'Add items to start tracking your collection',
}: EmptyStackStateProps) {
  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={`${title}. ${subtitle}`}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/add2stack')}>
        <Text style={styles.buttonText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  title: {
    fontSize: typography.font.lg,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.font.md,
    color: colors.grey,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.font.md,
    fontWeight: '600',
  },
});
