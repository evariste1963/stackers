import { Text, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { colors, globalStyles, toggleStyles } from '@/styles/global';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import StackValueBlock from '@/components/StackValueBlock';
import PageHeader from '@/components/PageHeader';
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
    refresh();
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
      <View style={globalStyles.tabPageContainer}>
        <PageHeader title="Stackers" />

        <View style={styles.toggleWrapper}>
          <View style={toggleStyles.container}>
            <TouchableOpacity
              style={[
                toggleStyles.option,
                selectedMetal === 'gold' && { backgroundColor: colors.gold }
              ]}
              onPress={() => setSelectedMetal('gold')}
            >
              <Text style={[toggleStyles.optionText, selectedMetal === 'gold' && toggleStyles.optionTextActive]}>Gold</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                toggleStyles.option,
                selectedMetal === 'silver' && { backgroundColor: colors.silver }
              ]}
              onPress={() => setSelectedMetal('silver')}
            >
              <Text style={[toggleStyles.optionText, selectedMetal === 'silver' && toggleStyles.optionTextActive]}>Silver</Text>
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
          <StackValueBlock value={totalStackValue || undefined} costValue={totalCostValue || undefined} settings={settings} onPress={() => router.push('/yourStack')} metal={selectedMetal} />
        </ScrollView >
      </View>
    </GestureDetector>
  );
}

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
toggleWrapper: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
