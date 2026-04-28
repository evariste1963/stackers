import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';

export default function StackGrid() {
  return (
    <View style={styles.grid}>
      <StackCard label='Calories' value='0' goal='2,000' color='#B8860B' />
      <StackCard label='Protein' value='0g' goal='150g' color='#B8860B' />
      <StackCard label='Carbs' value='0g' goal='250g' color='#B8860B' />
      <StackCard label='Fat' value='0g' goal='65g' color='#B8860B' />
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
