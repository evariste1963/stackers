import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { colors, spacing, typography } from '@/styles/global';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

interface EmptyStackStateProps {
  title?: string;
  subtitle?: string;
}

export default function EmptyStackState({
  title = 'Your Stack is Empty',
  subtitle = 'Add items to start tracking your collection',
}: EmptyStackStateProps) {
  const { colors: themeColors } = useTheme();
  const s = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={s.container} accessibilityRole="text" accessibilityLabel={`${title}. ${subtitle}`}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={s.button} onPress={() => router.push('/add2stack')}>
        <Text style={s.buttonText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(c: typeof colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl * 2,
    },
    title: {
      fontSize: typography.font.lg,
      fontWeight: 'bold',
      color: c.gold,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.font.md,
      color: c.grey,
      marginBottom: spacing.lg,
    },
    button: {
      backgroundColor: c.gold,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 8,
    },
    buttonText: {
      color: c.background,
      fontSize: typography.font.md,
      fontWeight: '600',
    },
  });
}
