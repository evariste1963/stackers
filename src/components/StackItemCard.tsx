import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { colors } from '@/styles/global';
import { useTheme } from '@/contexts/ThemeContext';
import type { StackItem } from '@/services/stackStorage';
import { deleteItems } from '@/services/stackStorage';
import { getUnitAbbrev, getCurrencySymbol } from '@/utils/formatters';
import { ThemeColors, type MetalType } from '@/styles/themeColors';

type StackItemCardProps = {
  item: StackItem;
  latestPrice: number | null;
  currency: string;
  weightUnit?: string;
  onDeleted: () => void;
  onPress?: () => void;
  metal?: MetalType;
};

function StackItemCard({ item, latestPrice, currency, weightUnit = 'toz', onDeleted, onPress, metal = 'gold' }: StackItemCardProps) {
  const { colors: themeColors } = useTheme();
  const s = useMemo(() => createStyles(themeColors), [themeColors]);
  const [imageError, setImageError] = useState(false);

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
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.6}>
        <Text style={s.deleteIcon}>✕</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {item.imageUri && !imageError ? (
          <Image
            source={{ uri: item.imageUri, cache: 'force-cache' }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[s.placeholderText, { color: ThemeColors[metal].primary }]}>{item.code}</Text>
          </View>
        )}
      </View>
      <View style={s.info}>
        <Text style={[s.code, { color: ThemeColors[metal].primary }]}>{item.code}</Text>
        <Text style={s.detail}>Weight {unitAbbrev}: {item.weight}</Text>
        <Text style={s.detail}>Cost/{unitAbbrev}: {sym}{costPerToz.toFixed(2)}</Text>
        <Text style={s.detail}>Total cost: {sym}{totalCost.toFixed(2)}</Text>

        <View style={s.divider} />

        {latestPrice !== null && currentValue !== null ? (
          <>
            <Text style={s.valueLabel}>Current value</Text>
            <Text style={[s.valueAmount, { color: ThemeColors[metal].primary }]}>{sym}{currentValue.toFixed(2)}</Text>
            <View style={styles.changeRow}>
              <Text style={[s.changePct, isPositive ? s.positive : s.negative]}>
                {isPositive ? '+' : ''}{valueChangePct?.toFixed(1)}%
              </Text>
              <Text style={[s.changeAmt, isPositive ? s.positive : s.negative]}>
                {isPositive ? '+' : ''}{sym}{Math.abs(valueChange ?? 0).toFixed(2)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[s.detail, s.noPrice]}>No price data</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(StackItemCard);

const styles = StyleSheet.create({
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
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

function createStyles(c: typeof colors) {
  return StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: c.themeGrey,
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
      color: c.red,
      fontSize: 14,
      fontWeight: 'bold',
    },
    placeholderText: {
      color: c.gold,
      fontSize: 24,
      fontWeight: 'bold',
    },
    info: {
      padding: 8,
    },
    code: {
      fontSize: 16,
      fontWeight: 'bold',
      color: c.gold,
      marginBottom: 4,
    },
    detail: {
      fontSize: 11,
      color: c.grey,
      marginBottom: 2,
    },
    noPrice: {
      fontStyle: 'italic',
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: c.lightGrey,
      marginVertical: 4,
    },
    valueLabel: {
      fontSize: 10,
      color: c.grey,
      marginBottom: 1,
    },
    valueAmount: {
      fontSize: 15,
      fontWeight: 'bold',
      color: c.gold,
      marginBottom: 2,
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
      color: c.changeGreen,
    },
    negative: {
      color: c.red,
    },
  });
}
