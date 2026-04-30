import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';
import { colors } from '@/styles/global';

export default function StackGrid() {
  return (
    <View style={styles.grid}>
      <StackCard label='9-Karat' value='' goal='GBP' color={colors.darkGold} />
      <StackCard label='18-Karat' value='' goal='GBP' color={colors.darkGold} />
      <StackCard label='22-Karat' value='' goal='GBP' color={colors.darkGold} />
      <StackCard label='24-Karat' value='' goal='GBP' color={colors.darkGold} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 40,
  },
});
