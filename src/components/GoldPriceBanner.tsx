import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/global';
import { type GoldPriceData } from '@/services/priceService';
import { type UserSettings } from '@/services/settingsService';
import { getCurrencySymbol, formatDate } from '@/utils/formatters';

type GoldPriceBannerProps = {
  priceData: GoldPriceData | null;
  isLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  settings: UserSettings;
  showRefresh?: boolean;
};

export default function GoldPriceBanner({ priceData, isLoading, error, refreshPrice, settings, showRefresh = true }: GoldPriceBannerProps) {

  const formatPrice = (price: number | undefined) => {
    if (!price) return showRefresh ? 'Tap refresh to fetch' : 'No price data';
    const symbol = getCurrencySymbol(settings.currency);
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
          <View style={styles.priceRow}>
            <Text style={[styles.price, { flex: 0.6 }]}>{formatPrice(priceData?.price)}</Text>
            {priceData?.change !== undefined && priceData?.change !== null && (
              <View style={styles.changeBlockWrapper}>
                <Text style={[styles.changeValue, { color: changeColor }]}>
                  {formatChange(priceData.change)}
                </Text>
                <Text style={[styles.changePercent, { color: changeColor }]}>
                  {formatChangePercent(priceData.changePercent)}
                </Text>
              </View>
            )}
          </View>
          {priceData?.date && (
            <Text style={styles.date}>Last updated: {formatDate(priceData.date)}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        {showRefresh && (
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonLoading, isLoading && styles.buttonDisabled]}
            onPress={refreshPrice}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>↻ Refresh</Text>
            )}
          </TouchableOpacity>
        )}
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
    marginBottom: 15,
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
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  } as const,
  changeBlockWrapper: {
    flex: 0.4,
    alignItems: 'flex-start',
  } as const,
  changeValue: {
    fontSize: 14,
    fontWeight: '500',
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
  buttonLoading: {
    backgroundColor: 'transparent',
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
