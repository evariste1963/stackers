import { globalStyles } from '@/styles/global';
import { Text, Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import HomeHeader from '@/components/HomeHeader';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import StackValueBlock from '@/components/StackValueBlock';
import { useGoldPrice, UseGoldPriceResult } from '@/hooks/useGoldPrice';
import { colors } from '@/styles/global';

export default function HomeScreen() {
  const router = useRouter();
  const { priceData, history, isLoading, error, refreshPrice, settings, apiKeyConfigured, isSettingsLoading }: UseGoldPriceResult = useGoldPrice();

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
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Stackers</Text>
        </View>
      </View>
      <HomeHeader />
      <GoldPriceBanner priceData={priceData} isLoading={isLoading} error={error} refreshPrice={refreshPrice} settings={settings} />
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={globalStyles.chart}>
          <ChartArea history={history} />
        </View>
        <StackGrid price={priceData} />
        <StackValueBlock value={undefined} settings={settings} />
      </View>
    </ScrollView >
  );
}
