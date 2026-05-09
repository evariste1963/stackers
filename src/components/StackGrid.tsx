import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import StackCard from './StackCard';
import { getLatestGoldPrice, getLatestSilverPrice, type MetalPriceData } from '@/services/metalPriceService';
import { colors } from '@/styles/global';
import { usePrice } from '@/contexts/PriceContext';

interface StackGridProps {
  price?: MetalPriceData;
  metal?: 'gold' | 'silver';
}

export default function StackGrid({ price, metal = 'gold' }: StackGridProps) {
  const [priceData, setPriceData] = useState<MetalPriceData | null>(price ?? null);
  const { getAdjustedBidPrice } = usePrice();

  useEffect(() => {
    if (priceData) return;
    if (metal === 'silver') {
      getLatestSilverPrice().then(setPriceData);
    } else {
      getLatestGoldPrice().then(setPriceData);
    }
  }, [priceData, metal]);

  useEffect(() => {
    if (price) {
      setPriceData(price);
    }
  }, [price]);

  const adjustedBid = getAdjustedBidPrice(metal);
  
  const displayBidPrice = adjustedBid > 0 ? adjustedBid : (priceData?.bid && priceData.bid > 0 ? priceData.bid : (priceData?.price ?? 0));

  const cards = [
    { label: 'ask-price', field: 'ask' as const },
    { label: 'bid-price', field: 'bid' as const, adjustedValue: displayBidPrice },
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
          {row.map(({ label, field, adjustedValue }) => (
            <StackCard
              key={field}
              label={label}
              value={field === 'bid' && adjustedValue ? adjustedValue.toFixed(2) : (priceData ? (priceData[field] as number).toFixed(2) : '')}
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
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
