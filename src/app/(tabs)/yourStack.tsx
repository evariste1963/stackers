import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { getLatestGoldPrice, getLatestSilverPrice } from '@/services/metalPriceService';
import { getUserSettings } from '@/services/settingsService';
import { useStack } from '@/contexts/StackContext';
import { usePrice } from '@/contexts/PriceContext';
import StackItemCard from '@/components/StackItemCard';
import EmptyStackState from '@/components/EmptyStackState';

export default function YourStackScreen() {
  const { items, refresh } = useStack();
  const { swipeGesture } = useSwipeNavigation('yourStack');
  const { getAdjustedBidPrice } = usePrice();
  const [latestGoldPrice, setLatestGoldPrice] = useState<number | null>(null);
  const [latestSilverPrice, setLatestSilverPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState('GBP');
  const [weightUnit, setWeightUnit] = useState('toz');
  const [selectedMetal, setSelectedMetal] = useState<'gold' | 'silver'>('gold');

  const loadPriceAndSettings = useCallback(async () => {
    const goldPriceData = await getLatestGoldPrice();
    if (goldPriceData) {
      setLatestGoldPrice(goldPriceData.bid);
      setCurrency(goldPriceData.currency);
    }
    const silverPriceData = await getLatestSilverPrice();
    if (silverPriceData) {
      setLatestSilverPrice(silverPriceData.bid);
    }
    const settings = await getUserSettings();
    if (settings.currency) {
      setCurrency(settings.currency);
    }
    if (settings.unit) {
      setWeightUnit(settings.unit);
    }
    setSelectedMetal(settings.defaultMetal || 'gold');
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadPriceAndSettings();
    }, [refresh, loadPriceAndSettings])
  );

  const handleDeleted = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleEdit = useCallback((itemId: number) => {
    router.push({ pathname: '/add2stack', params: { editId: itemId.toString() } });
  }, []);

  const filteredItems = items.filter(item => item.metal === selectedMetal);
  const adjustedBidPrice = getAdjustedBidPrice(selectedMetal);
  const latestPrice = adjustedBidPrice > 0 ? adjustedBidPrice : (selectedMetal === 'gold' ? latestGoldPrice : latestSilverPrice);

  const rows = [];
  for (let i = 0; i < filteredItems.length; i += 2) {
    rows.push(filteredItems.slice(i, i + 2));
  }

return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Your Stack</Text>
        </View>

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

        <ScrollView style={styles.gridContainer} contentContainerStyle={styles.scrollContent}>
          {filteredItems.length === 0 ? (
            <EmptyStackState />
          ) : (
            <View style={styles.grid}>
              {rows.map((row, ri) => (
                <View key={`row-${ri}`} style={styles.row}>
                  {row.map(item => (
                    <StackItemCard
                      key={item.id}
                      item={item}
                      latestPrice={latestPrice}
                      currency={currency}
                      weightUnit={weightUnit}
                      onDeleted={handleDeleted}
                      onPress={() => handleEdit(item.id)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
    marginBottom: 15,
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
  container: {
    flex: 1,
    backgroundColor: globalStyles.container.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gridContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});