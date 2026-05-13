import React, { memo, useMemo } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/styles/global';
import { type UserSettings } from '@/services/settingsService';
import { getCurrencySymbol } from '@/utils/formatters';

type StackValueBlockProps = {
  value: string | number | undefined;
  costValue?: string | number | undefined;
  settings: UserSettings;
  onPress?: () => void;
  metal?: 'gold' | 'silver';
};

function StackValueBlock({ value, costValue, settings, onPress, metal = 'gold' }: StackValueBlockProps) {
  const { formattedCost, formattedValue, formattedChange, formattedChangePct, isPositive, changeColor } = useMemo(() => {
    const symbol = getCurrencySymbol(settings.currency);

    const formatValue = (val: string | number | undefined): string => {
      if (val === undefined || val === null || val === '') return '';
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(numVal)) return '';
      return `${symbol}${numVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const numCost = typeof costValue === 'number' ? costValue : parseFloat(costValue as string) || 0;
    const pos = numValue >= numCost;

    const valueChange = numValue - numCost;
    const valueChangePct = numCost > 0 ? (valueChange / numCost) * 100 : 0;
    const chgColor = valueChange >= 0 ? colors.changeGreen : colors.red;

    const sign = valueChange > 0 ? '+' : '';
    const changeStr = `${sign}${symbol}${Math.abs(valueChange).toFixed(2)}`;
    const changePctStr = `(${sign}${Math.abs(valueChangePct).toFixed(2)}%)`;

    return {
      formattedCost: formatValue(costValue),
      formattedValue: formatValue(value),
      formattedChange: changeStr,
      formattedChangePct: changePctStr,
      isPositive: pos,
      changeColor: chgColor,
    };
  }, [value, costValue, settings.currency]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.title, { color: metal === 'silver' ? colors.silver : colors.gold }]}>Stack Value</Text>
      <View style={styles.row}>
        <View style={styles.columnLeft}>
          <Text style={[styles.label, styles.labelLeft]}>Total cost</Text>
          <Text style={[styles.value, styles.valueLeft, { color: metal === 'silver' ? colors.silver : colors.gold }]}>{formattedCost}</Text>
        </View>
        <View style={styles.columnRight}>
          <Text style={[styles.label, styles.labelRight]}>Current value</Text>
          <Text style={[styles.value, isPositive ? styles.valueGreen : styles.valueRed, styles.valueRight, { color: metal === 'silver' ? colors.silver : colors.gold }]}>{formattedValue}</Text>
        </View>
      </View>
      <View style={styles.changeContainer}>
        <View style={styles.changeRow}>
          <Text style={[styles.changeValue, { color: changeColor }]}>
            {formattedChange}
          </Text>
          <Text style={[styles.changePercent, { color: changeColor }]}>
            {formattedChangePct}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(StackValueBlock);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  columnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  changeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    color: colors.gold,
    fontWeight: 'bold',
    marginBottom: 1,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  },
  labelLeft: {
    textAlign: 'left',
  },
  labelRight: {
    textAlign: 'right',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueLeft: {
    textAlign: 'left',
  },
  valueRight: {
    textAlign: 'right',
  },
  valueGreen: {
    color: colors.changeGreen,
  },
  valueRed: {
    color: colors.red,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '500',
  },
});