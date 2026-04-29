import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';

export default function StackGrid() {
  return (
    <View style={styles.grid}>
      <StackCard label='9-Karat' value='' goal='GBP' color='#B8860B' />
      <StackCard label='18-Karat' value='' goal='GBP' color='#B8860B' />
      <StackCard label='22-Karat' value='' goal='GBP' color='#B8860B' />
      <StackCard label='24-Karat' value='' goal='GBP' color='#B8860B' />
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
