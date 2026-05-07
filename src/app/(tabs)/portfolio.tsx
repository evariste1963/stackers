import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { getLatestPrice } from '@/services/priceService';
import { getLatestSilverPrice } from '@/services/silverPriceService';
import { getUserSettings } from '@/services/settingsService';
import { useStack } from '@/contexts/StackContext';
import { usePrice } from '@/contexts/PriceContext';
import { getCurrencySymbol, getUnitAbbrev } from '@/utils/formatters';

export default function PortfolioScreen() {
  const { items, refresh } = useStack();
  const { swipeGesture } = useSwipeNavigation('portfolio');
  const { getAdjustedBidPrice } = usePrice();

  const [goldBid, setGoldBid] = useState<number | null>(null);
  const [goldSpot, setGoldSpot] = useState<number | null>(null);
  const [silverBid, setSilverBid] = useState<number | null>(null);
  const [silverSpot, setSilverSpot] = useState<number | null>(null);
  const [currency, setCurrency] = useState('GBP');
  const [unit, setUnit] = useState('toz');
  const [goldUserPremium, setGoldUserPremium] = useState<number | null>(null);
  const [silverUserPremium, setSilverUserPremium] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadData();
    }, [refresh])
  );

  async function loadData() {
    const goldData = await getLatestPrice();
    if (goldData) {
      setGoldBid(goldData.bid);
      setGoldSpot(goldData.price);
      setCurrency(goldData.currency);
    }
    const silverData = await getLatestSilverPrice();
    if (silverData) {
      setSilverBid(silverData.bid);
      setSilverSpot(silverData.price);
    }
    const settings = await getUserSettings();
    setCurrency(settings.currency);
    setUnit(settings.unit);
    setGoldUserPremium(settings.manualGoldPremium ?? null);
    setSilverUserPremium(settings.manualSilverPremium ?? null);
  }

  const goldItems = items.filter(i => i.metal === 'gold');
  const silverItems = items.filter(i => i.metal === 'silver');

  const goldAdjustedBid = getAdjustedBidPrice('gold');
  const silverAdjustedBid = getAdjustedBidPrice('silver');

  const goldValue = goldItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    return sum + (weight * (goldAdjustedBid > 0 ? goldAdjustedBid : (goldBid || 0)));
  }, 0);

  const goldCost = goldItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const cost = parseFloat(item.purchasePrice) || 0;
    return sum + (weight * cost);
  }, 0);

  const goldProfit = goldValue - goldCost;
  const goldProfitPercent = goldCost > 0 ? (goldProfit / goldCost) * 100 : 0;
  const goldPremium = goldUserPremium !== null ? goldUserPremium : (goldSpot && goldSpot > 0 ? ((goldSpot - goldBid) / goldSpot) * 100 : 0);

  const silverValue = silverItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    return sum + (weight * (silverAdjustedBid > 0 ? silverAdjustedBid : (silverBid || 0)));
  }, 0);

  const silverCost = silverItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const cost = parseFloat(item.purchasePrice) || 0;
    return sum + (weight * cost);
  }, 0);

  const silverProfit = silverValue - silverCost;
  const silverProfitPercent = silverCost > 0 ? (silverProfit / silverCost) * 100 : 0;
  const silverPremium = silverUserPremium !== null ? silverUserPremium : (silverSpot && silverSpot > 0 ? ((silverSpot - silverBid) / silverSpot) * 100 : 0);

  const totalValue = goldValue + silverValue;
  const totalCost = goldCost + silverCost;
  const totalProfit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const symbol = getCurrencySymbol(currency);
  const unitAbbr = getUnitAbbrev(unit);

  return (
    <GestureDetector gesture={swipeGesture}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Portfolio</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>{symbol}{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.costLabel}>Cost: {symbol}{totalCost.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={[styles.profitLabel, totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
            {totalProfit >= 0 ? '+' : ''}{symbol}{totalProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gold</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Items</Text>
              <Text style={styles.statValue}>{goldItems.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{goldItems.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0).toFixed(2)} {unitAbbr}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Value</Text>
              <Text style={[styles.statValue, goldProfit >= 0 ? styles.valuePositive : styles.valueNegative]}>{symbol}{goldValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Cost: {symbol}{goldCost.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={[styles.profitLabel, goldProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
              {goldProfit >= 0 ? '+' : ''}{symbol}{goldProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({goldProfitPercent.toFixed(2)}%)
            </Text>
          </View>
          {goldBid && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.priceInfo}>Bid: {symbol}{goldAdjustedBid.toLocaleString('en-GB', { minimumFractionDigits: 2 })}/{unitAbbr}</Text>
              {goldSpot && goldBid && (
                <Text style={styles.priceInfo}>Premium: {goldPremium >= 0 ? '+' : ''}{goldPremium.toFixed(2)}%</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Silver</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Items</Text>
              <Text style={styles.statValue}>{silverItems.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{silverItems.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0).toFixed(2)} {unitAbbr}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Value</Text>
              <Text style={[styles.statValue, silverProfit >= 0 ? styles.valuePositive : styles.valueNegative]}>{symbol}{silverValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Cost: {symbol}{silverCost.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={[styles.profitLabel, silverProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
              {silverProfit >= 0 ? '+' : ''}{symbol}{silverProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({silverProfitPercent.toFixed(2)}%)
            </Text>
          </View>
          {silverBid && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.priceInfo}>Bid: {symbol}{silverAdjustedBid.toLocaleString('en-GB', { minimumFractionDigits: 2 })}/{unitAbbr}</Text>
              {silverSpot && silverBid && (
                <Text style={styles.priceInfo}>Premium: {silverPremium >= 0 ? '+' : ''}{silverPremium.toFixed(2)}%</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  summaryCard: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 4,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  profitPositive: {
    color: colors.changeGreen,
  },
  profitNegative: {
    color: colors.red,
  },
  section: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  valuePositive: {
    color: colors.changeGreen,
  },
  valueNegative: {
    color: colors.red,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  priceInfo: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumInfo: {
    fontSize: 12,
    color: colors.silver,
    marginTop: 4,
    textAlign: 'center',
  },
});