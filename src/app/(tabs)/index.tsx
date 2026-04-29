import { globalStyles } from '@/styles/global';
import { Text, Image, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import HomeHeader from '@/components/HomeHeader';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';
import { useGoldPrice, UseGoldPriceResult } from '@/hooks/useGoldPrice';

function GoldPriceBanner() {
  const { priceData, isLoading, error, refreshPrice, settings }: UseGoldPriceResult = useGoldPrice();

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
    if (change === undefined || change === null) return '#888';
    if (change < 0) return '#e74c3c';
    if (change === 0) return '#f39c12';
    return '#27ae60';
  };

  const changeColor = getChangeColor(priceData?.change);

  return (
    <View style={bannerStyles.container}>
      <View style={bannerStyles.content}>
        <View style={bannerStyles.left}>
          <Text style={bannerStyles.label}>Gold Price ({settings.currency}/{settings.unit})</Text>
          <View style={bannerStyles.priceContainer}>
            <View style={bannerStyles.priceRow}>
              <View style={bannerStyles.priceWrapper}>
                <Text style={bannerStyles.price}>{formatPrice(priceData?.price)}</Text>
              </View>
              {priceData?.change !== undefined && priceData?.change !== null && (
                <View style={bannerStyles.changeBlockWrapper}>
                  <View style={bannerStyles.changeBlock}>
                    <Text style={[bannerStyles.changeValue, { color: changeColor }]}>
                      {formatChange(priceData.change)}
                    </Text>
                    <Text style={[bannerStyles.changePercent, { color: changeColor }]}>
                      {formatChangePercent(priceData.changePercent)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          {priceData?.date && (
            <Text style={bannerStyles.date}>Last updated: {formatDate(priceData.date)}</Text>
          )}
          {error && <Text style={bannerStyles.error}>{error}</Text>}
        </View>
        <TouchableOpacity
          style={[bannerStyles.button, isLoading && bannerStyles.buttonDisabled]}
          onPress={refreshPrice}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={bannerStyles.buttonText}>↻ Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const bannerStyles = {
  container: {
    width: '100%',
    backgroundColor: '#1a1a2e',
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
    color: '#888',
    marginBottom: 4,
  } as const,
  price: {
    fontSize: 28,
    color: '#D4AF37',
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
    color: '#666',
    marginTop: 4,
  } as const,
  error: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
  } as const,
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  } as const,
  buttonDisabled: {
    opacity: 0.7,
  } as const,
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  } as const,
};

export default function HomeScreen() {
  const router = useRouter();
  const { apiKeyConfigured, isSettingsLoading }: UseGoldPriceResult = useGoldPrice();

  useEffect(() => {
    if (!isSettingsLoading && !apiKeyConfigured) {
      router.replace('/api-settings');
    }
  }, [isSettingsLoading, apiKeyConfigured, router]);

  if (isSettingsLoading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#D4AF37', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!apiKeyConfigured) {
    return null;
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Stackers</Text>
        </View>
      </View>
      <HomeHeader />
      <GoldPriceBanner />
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={globalStyles.chart}>
          <ChartArea />
        </View>
        <StackGrid />
      </View>
    </ScrollView >
  );
}
