import { globalStyles } from '@/styles/global';
import { Text, Image, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import StackValueBlock from '@/components/StackValueBlock';
import { useGoldPrice, UseGoldPriceResult } from '@/hooks/useGoldPrice';
import { colors } from '@/styles/global';
import { getAllItems, type StackItem } from '@/services/stackStorage';

export default function HomeScreen() {
  const { priceData, history, isLoading, error, refreshPrice, settings, apiKeyConfigured, isSettingsLoading }: UseGoldPriceResult = useGoldPrice();
  const [items, setItems] = useState<StackItem[]>([]);

  const loadItems = useCallback(async () => {
    const all = await getAllItems();
    setItems(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const totalStackValue = items.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const price = priceData?.price || 0;
    return sum + (weight * price);
  }, 0);

  const totalCostValue = items.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const costPerUnit = parseFloat(item.purchasePrice) || 0;
    return sum + (weight * costPerUnit);
  }, 0);

  useEffect(() => {
    if (!isSettingsLoading && !apiKeyConfigured) {
      router.replace('/api-settings');
    }
  }, [isSettingsLoading, apiKeyConfigured, router]);

  if (isSettingsLoading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.gold, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!apiKeyConfigured) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[globalStyles.header, { paddingHorizontal: 20, paddingTop: 60 }]}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Stackers</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <GoldPriceBanner priceData={priceData} isLoading={isLoading} error={error} refreshPrice={refreshPrice} settings={settings} />
        <View style={{ height: 160, width: '100%', marginTop: 0, backgroundColor: colors.background, alignItems: 'center' }}>
          <ChartArea history={history} />
        </View>
        <StackGrid price={priceData ?? undefined} />
        <StackValueBlock value={totalStackValue || undefined} costValue={totalCostValue || undefined} settings={settings} />
      </ScrollView >
    </View>
  );
}
