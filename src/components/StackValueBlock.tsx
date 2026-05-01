import { Text, View } from 'react-native';
import { colors } from '@/styles/global';
import { UserSettings } from '@/services/goldPriceStorage';

type StackValueBlockProps = {
  value: string | number | undefined;
  settings: UserSettings;
};

export default function StackValueBlock({ value, settings }: StackValueBlockProps) {
  const formatValue = (val: string | number | undefined) => {
    if (val === undefined || val === null || val === '') return '';
    const symbol = settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : '€';
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numVal)) return '';
    return `${symbol}${numVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stack value</Text>
      <Text style={styles.value}>{formatValue(value)}</Text>
      <View style={styles.saleRow}>
        <Text style={styles.saleLabel}>Sale Price:</Text>
        <Text style={styles.saleValue}></Text>
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
    marginTop: 20,
  } as const,
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  } as const,
  value: {
    fontSize: 20,
    color: colors.gold,
    fontWeight: 'bold',
  } as const,
  saleRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  } as const,
  saleLabel: {
    fontSize: 12,
    color: colors.grey,
  } as const,
  saleValue: {
    fontSize: 20,
    color: colors.gold,
    fontWeight: 'bold',
    marginLeft: 8,
  } as const,
};
