import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';

export default function StackGrid() {
  return (
    <View style={styles.grid}>
      <StackCard label='Calories' value='0' goal='2,000' color='#ff6b6b' />
      <StackCard label='Protein' value='0g' goal='150g' color='#4ecdc4' />
      <StackCard label='Carbs' value='0g' goal='250g' color='#ffd93d' />
      <StackCard label='Fat' value='0g' goal='65g' color='#6bcb77' />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
