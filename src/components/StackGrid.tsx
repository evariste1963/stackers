import { useEffect, useState, useMemo } from 'react';
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
  const [priceData, setPriceData] = useState<MetalPriceData | null>(null);
  const { getAdjustedBidPrice, settings } = usePrice();

  useEffect(() => {
    if (price) {
      setPriceData(price);
      return;
    }
    const fetchPrice = metal === 'silver' ? getLatestSilverPrice : getLatestGoldPrice;
    fetchPrice().then(setPriceData);
  }, [price, metal]);

  const adjustedBid = getAdjustedBidPrice(metal);
  
  const displayBidPrice = adjustedBid > 0 ? adjustedBid : (priceData?.bid && priceData.bid > 0 ? priceData.bid : (priceData?.price ?? 0));

  const { cards, rows } = useMemo(() => {
    const cardData = [
      { label: 'ask-price', field: 'ask' as const },
      { label: 'bid-price', field: 'bid' as const, adjustedValue: displayBidPrice },
      { label: 'high', field: 'high' as const },
      { label: 'low', field: 'low' as const },
    ];
    return {
      cards: cardData,
      rows: [[cardData[0], cardData[1]], [cardData[2], cardData[3]]] as const,
    };
  }, [displayBidPrice]);

  const currency = priceData?.currency ?? settings.currency;

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(({ label, field, adjustedValue }) => (
            <StackCard
              key={field}
              label={label}
              value={field === 'bid' && adjustedValue ? adjustedValue.toFixed(2) : (priceData ? (priceData[field] as number).toFixed(2) : '')}
              goal={currency}
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
    justifyContent: 'space-between',
  },
});
