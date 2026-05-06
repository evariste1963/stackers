import { Text, Image, ScrollView, View, TouchableOpacity } from 'react-native';
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
    updateManualSilverPrice
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
  
  const totalStackValue = filteredItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const price = priceData?.price || 0;
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
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.gold, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  const hasAnyOffGrid = offGridMode || silverOffGridMode;
  if (!apiKeyConfigured && !hasAnyOffGrid) {
    return null;
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[globalStyles.header, { paddingHorizontal: 20, paddingTop: 60 }]}>
          <View style={globalStyles.logoContainer}>
            <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
            <Text style={globalStyles.title}>Stackers</Text>
          </View>
        </View>
        
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
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
          <View style={{ height: 160, width: '100%', marginTop: 0, backgroundColor: colors.background, alignItems: 'center' }}>
            <ChartArea history={history} />
          </View>
          <StackGrid price={priceData ?? undefined} />
          <StackValueBlock value={totalStackValue || undefined} costValue={totalCostValue || undefined} settings={settings} onPress={() => router.push('/yourStack')} />
        </ScrollView >
      </View>
    </GestureDetector>
  );
}

const metalToggleStyles = {
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
};