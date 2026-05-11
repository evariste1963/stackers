import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { colors } from '@/styles/global';
import type { StackItem } from '@/services/stackStorage';
import { deleteItems } from '@/services/stackStorage';
import { getUnitAbbrev, getCurrencySymbol } from '@/utils/formatters';

type StackItemCardProps = {
  item: StackItem;
  latestPrice: number | null;
  currency: string;
  weightUnit?: string;
  onDeleted: () => void;
  onPress?: () => void;
};

function StackItemCard({ item, latestPrice, currency, weightUnit = 'toz', onDeleted, onPress }: StackItemCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Delete "${item.code}" from your stack?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteItems([item.id]);
            onDeleted();
          },
        },
      ]
    );
  };

  const { costPerToz, totalCost, currentValue, valueChange, valueChangePct, sym, isPositive, unitAbbrev } = useMemo(() => {
    const w = parseFloat(item.weight) || 0;
    const cost = parseFloat(item.purchasePrice) || 0;
    const total = cost * w;

    let currVal: number | null = null;
    let valChange: number | null = null;
    let valChangePct: number | null = null;
    
    if (latestPrice !== null && w > 0 && total > 0) {
      currVal = w * latestPrice;
      valChange = currVal - total;
      valChangePct = (valChange / total) * 100;
    }

    return {
      weightNum: w,
      costPerToz: cost,
      totalCost: total,
      currentValue: currVal,
      valueChange: valChange,
      valueChangePct: valChangePct,
      sym: getCurrencySymbol(currency),
      isPositive: (valChange ?? 0) >= 0,
      unitAbbrev: getUnitAbbrev(weightUnit),
    };
  }, [item.weight, item.purchasePrice, latestPrice, currency, weightUnit]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.6}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image 
            source={{ uri: item.imageUri, cache: 'force-cache' }} 
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{item.code}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.detail}>Weight {unitAbbrev}: {item.weight}</Text>
        <Text style={styles.detail}>Cost/{unitAbbrev}: {sym}{costPerToz.toFixed(2)}</Text>
        <Text style={styles.detail}>Total cost: {sym}{totalCost.toFixed(2)}</Text>

        <View style={styles.divider} />

        {latestPrice !== null && currentValue !== null ? (
          <>
            <Text style={styles.valueLabel}>Current value</Text>
            <Text style={styles.valueAmount}>{sym}{currentValue.toFixed(2)}</Text>
            <View style={styles.changeRow}>
              <Text style={[styles.changePct, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? '+' : ''}{valueChangePct?.toFixed(1)}%
              </Text>
              <Text style={[styles.changeAmt, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? '+' : ''}{sym}{Math.abs(valueChange ?? 0).toFixed(2)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.detail, styles.noPrice]}>No price data</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(StackItemCard);

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    overflow: 'hidden',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    color: colors.red,
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    padding: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 4,
  },
  detail: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 2,
  },
  noPrice: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: 4,
  },
  valueLabel: {
    fontSize: 10,
    color: colors.grey,
    marginBottom: 1,
  },
  valueAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 2,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changePct: {
    fontSize: 10,
    fontWeight: '600',
  },
  changeAmt: {
    fontSize: 10,
    fontWeight: '600',
  },
  positive: {
    color: colors.changeGreen,
  },
  negative: {
    color: colors.red,
  },
});