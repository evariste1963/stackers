import { Text, Image, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { colors, globalStyles } from '@/styles/global';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import StackValueBlock from '@/components/StackValueBlock';
import { usePrice } from '@/contexts/PriceContext';
import { useStack } from '@/contexts/StackContext';

export default function HomeScreen() {
  const {
    goldPriceData,
    silverPriceData,
    goldHistory,
    silverHistory,
    isLoading,
    refreshGoldPrice,
    refreshSilverPrice,
    settings,
    apiKeyConfigured,
    isSettingsLoading,
    refreshSettings,
    refreshPricesFromDb,
    offGridMode,
    silverOffGridMode,
    updateManualPrice,
    updateManualSilverPrice,
    getAdjustedBidPrice
  } = usePrice();
  const { items, refresh } = useStack();
  const { swipeGesture } = useSwipeNavigation('');
  const [selectedMetal, setSelectedMetal] = useState<'gold' | 'silver'>('gold');

  useEffect(() => {
    refreshSettings();
    refreshPricesFromDb();
  }, []);

  useEffect(() => {
    setSelectedMetal(settings.defaultMetal || 'gold');
  }, [settings.defaultMetal]);

  const priceData = selectedMetal === 'gold' ? goldPriceData : silverPriceData;
  const history = selectedMetal === 'gold' ? goldHistory : silverHistory;
  const metalOffGridMode = selectedMetal === 'gold' ? offGridMode : silverOffGridMode;
  const refreshPrice = selectedMetal === 'gold' ? refreshGoldPrice : refreshSilverPrice;
  const updateManualPriceFn = selectedMetal === 'gold' ? updateManualPrice : updateManualSilverPrice;

  const filteredItems = items.filter(item => item.metal === selectedMetal);

  const adjustedBidPrice = getAdjustedBidPrice(selectedMetal);

  const totalStackValue = filteredItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const price = adjustedBidPrice || 0;
    return sum + (weight * price);
  }, 0);

  const totalCostValue = filteredItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const costPerUnit = parseFloat(item.purchasePrice) || 0;
    return sum + (weight * costPerUnit);
  }, 0);

  useEffect(() => {
    if (!isSettingsLoading) {
      const hasAnyOffGrid = offGridMode || silverOffGridMode;
      if (!apiKeyConfigured && !hasAnyOffGrid) {
        router.replace('/guide');
      }
    }
  }, [isSettingsLoading, apiKeyConfigured, offGridMode, silverOffGridMode, router]);

  if (isSettingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hasAnyOffGrid = offGridMode || silverOffGridMode;
  if (!apiKeyConfigured && !hasAnyOffGrid) {
    return null;
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.root}>
        <View style={styles.pageHeader}>
          <View style={globalStyles.logoContainer}>
            <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
            <Text style={globalStyles.title}>Stackers</Text>
          </View>
        </View>

        <View style={styles.toggleWrapper}>
          <View style={metalToggleStyles.container}>
            <TouchableOpacity
              style={[metalToggleStyles.option, selectedMetal === 'gold' && metalToggleStyles.optionActive]}
              onPress={() => setSelectedMetal('gold')}
            >
              <Text style={[metalToggleStyles.optionText, selectedMetal === 'gold' && metalToggleStyles.optionTextActive]}>Gold</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[metalToggleStyles.option, selectedMetal === 'silver' && metalToggleStyles.optionActive]}
              onPress={() => setSelectedMetal('silver')}
            >
              <Text style={[metalToggleStyles.optionText, selectedMetal === 'silver' && metalToggleStyles.optionTextActive]}>Silver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GoldPriceBanner
            priceData={priceData}
            metal={selectedMetal}
            isLoading={isLoading}
            error={null}
            refreshPrice={refreshPrice}
            settings={settings}
            offGridMode={metalOffGridMode}
            onManualPriceChange={updateManualPriceFn}
          />
          <View style={globalStyles.chart}>
            <ChartArea history={history} unit={settings.unit} metal={selectedMetal} />
          </View>
          <StackGrid price={priceData ?? undefined} metal={selectedMetal} />
          <StackValueBlock value={totalStackValue || undefined} costValue={totalCostValue || undefined} settings={settings} onPress={() => router.push('/yourStack')} />
        </ScrollView >
      </View>
    </GestureDetector>
  );
}

const metalToggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.gold,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grey,
  },
  optionTextActive: {
    color: '#000',
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gold,
    fontSize: 16,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
