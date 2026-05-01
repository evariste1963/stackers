import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';
import { getLatestPrice, type GoldPriceData } from '@/services/goldPriceStorage';
import { colors } from '@/styles/global';

interface StackGridProps {
  price?: GoldPriceData;
}

export default function StackGrid({ price }: StackGridProps) {
  const [priceData, setPriceData] = useState<GoldPriceData | null>(price ?? null);

  useEffect(() => {
    if (priceData) return;
    getLatestPrice().then(setPriceData);
  }, [priceData]);

  useEffect(() => {
    if (price) {
      setPriceData(price);
    }
  }, [price]);

  const cards = [
    { label: 'ask-price', field: 'ask' as const },
    { label: 'bid-price', field: 'bid' as const },
    { label: 'high', field: 'high' as const },
    { label: 'low', field: 'low' as const },
  ];

  const rows = [
    [cards[0], cards[1]],
    [cards[2], cards[3]],
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(({ label, field }) => (
            <StackCard
              key={field}
              label={label}
              value={priceData ? (priceData[field] as number).toFixed(2) : ''}
              goal={priceData?.currency ?? 'GBP'}
              color={colors.darkGold}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
