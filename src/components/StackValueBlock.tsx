import { Text, View } from 'react-native';
import { colors } from '@/styles/global';
import { UserSettings } from '@/services/goldPriceStorage';

type StackValueBlockProps = {
  value: string | number | undefined;
  costValue?: string | number | undefined;
  settings: UserSettings;
};

export default function StackValueBlock({ value, costValue, settings }: StackValueBlockProps) {
  const formatValue = (val: string | number | undefined) => {
    if (val === undefined || val === null || val === '') return '';
    const symbol = settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : '€';
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numVal)) return '';
    return `${symbol}${numVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
  const numCost = typeof costValue === 'number' ? costValue : parseFloat(costValue as string) || 0;
  const isPositive = numValue >= numCost;

  const valueChange = numValue - numCost;
  const valueChangePct = numCost > 0 ? (valueChange / numCost) * 100 : 0;
  const changeColor = valueChange >= 0 ? (colors.changeGreen || '#4caf50') : (colors.red || '#f44336');

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    const symbol = settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : '€';
    return `${sign}${symbol}${Math.abs(change).toFixed(2)}`;
  };

  const formatChangePercent = (changePct: number) => {
    const sign = changePct > 0 ? '+' : '';
    return `(${sign}${changePct.toFixed(2)}%)`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stack Info</Text>
      <View style={styles.row}>
        <View style={styles.columnLeft}>
          <Text style={[styles.label, styles.labelLeft]}>Total cost</Text>
          <Text style={[styles.value, styles.valueLeft]}>{formatValue(costValue)}</Text>
        </View>
        <View style={styles.columnRight}>
          <Text style={[styles.label, styles.labelRight]}>Current value</Text>
          <Text style={[styles.value, isPositive ? styles.valueGreen : styles.valueRed, styles.valueRight]}>{formatValue(value)}</Text>
        </View>
      </View>
      <View style={styles.changeContainer}>
        <View style={styles.changeRow}>
          <Text style={[styles.changeValue, { color: changeColor }]}>
            {formatChange(valueChange)}
          </Text>
          <Text style={[styles.changePercent, { color: changeColor }]}>
            {formatChangePercent(valueChangePct)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    marginTop: 10,
  } as const,
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as const,
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start',
  } as const,
  columnRight: {
    flex: 1,
    alignItems: 'flex-end',
  } as const,
  changeContainer: {
    alignItems: 'center',
    marginTop: 8,
  } as const,
  title: {
    fontSize: 20,
    color: colors.gold,
    fontWeight: 'bold',
    marginBottom: 1,
    textAlign: 'center',
  } as const,
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  } as const,
  labelLeft: {
    textAlign: 'left',
  } as const,
  labelCenter: {
    textAlign: 'center',
  } as const,
  labelRight: {
    textAlign: 'right',
  } as const,
  value: {
    fontSize: 20,
    color: colors.gold,
    fontWeight: 'bold',
  } as const,
  valueLeft: {
    textAlign: 'left',
  } as const,
  valueRight: {
    textAlign: 'right',
  } as const,
  valueGreen: {
    color: colors.changeGreen || '#4caf50',
  } as const,
  valueRed: {
    color: colors.red || '#f44336',
  } as const,
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  } as const,
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  } as const,
  changePercent: {
    fontSize: 12,
    fontWeight: '500',
  } as const,
};
