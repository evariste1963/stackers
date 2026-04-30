import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/global';
import { GoldPriceData, UserSettings } from '@/services/goldPriceStorage';

type GoldPriceBannerProps = {
  priceData: GoldPriceData | null;
  isLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  settings: UserSettings;
};

export default function GoldPriceBanner({ priceData, isLoading, error, refreshPrice, settings }: GoldPriceBannerProps) {

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Tap refresh to fetch';
    const symbol = settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number | undefined) => {
    if (change === undefined || change === null) return '';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number | undefined) => {
    if (changePercent === undefined || changePercent === null) return '';
    const symbol = changePercent > 0 ? '+' : '';
    return `(${symbol}${changePercent.toFixed(2)}%)`;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getChangeColor = (change: number | undefined) => {
    if (change === undefined || change === null) return colors.grey;
    if (change < 0) return colors.red;
    if (change === 0) return colors.orange;
    return colors.changeGreen;
  };

  const changeColor = getChangeColor(priceData?.change);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>Gold Price ({settings.currency}/{settings.unit})</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.priceWrapper}>
                <Text style={styles.price}>{formatPrice(priceData?.price)}</Text>
              </View>
              {priceData?.change !== undefined && priceData?.change !== null && (
                <View style={styles.changeBlockWrapper}>
                  <View style={styles.changeBlock}>
                    <Text style={[styles.changeValue, { color: changeColor }]}>
                      {formatChange(priceData.change)}
                    </Text>
                    <Text style={[styles.changePercent, { color: changeColor }]}>
                      {formatChangePercent(priceData.changePercent)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          {priceData?.date && (
            <Text style={styles.date}>Last updated: {formatDate(priceData.date)}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={refreshPrice}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>↻ Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as const,
  content: {
    flexDirection: 'row',
    marginLeft: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  left: {
    flex: 1,
  } as const,
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  } as const,
  price: {
    fontSize: 28,
    color: colors.gold,
    fontWeight: 'bold',
  } as const,
  priceContainer: {
    alignItems: 'flex-start',
  } as const,
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  } as const,
  priceWrapper: {
    flex: 0.6,
  } as const,
  changeBlockWrapper: {
    flex: 0.4,
    alignItems: 'flex-start',
  } as const,
  changeBlock: {
    alignItems: 'flex-start',
  } as const,
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
  } as const,
  changePercent: {
    fontSize: 14,
    fontWeight: '500',
  } as const,
  date: {
    fontSize: 11,
    color: colors.lightGrey,
    marginTop: 4,
  } as const,
  error: {
    fontSize: 11,
    color: colors.red,
    marginTop: 4,
  } as const,
  button: {
    backgroundColor: colors.themeBlue,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 16,
  } as const,
  buttonDisabled: {
    opacity: 0.7,
  } as const,
  buttonText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600' as const,
  } as const,
};
