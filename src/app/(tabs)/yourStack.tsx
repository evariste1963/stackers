import { toggleStyles, globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { getLatestGoldPrice, getLatestSilverPrice } from '@/services/metalPriceService';
import { useStack } from '@/contexts/StackContext';
import { usePrice } from '@/contexts/PriceContext';
import { useTheme } from '@/contexts/ThemeContext';
import StackItemCard from '@/components/StackItemCard';
import EmptyStackState from '@/components/EmptyStackState';
import { useMetal } from '@/contexts/MetalContext';

export default function YourStackScreen() {
  const { items, refresh } = useStack();
  const { swipeGesture } = useSwipeNavigation('yourStack');
  const { getAdjustedBidPrice, settings } = usePrice();
  const { selectedMetal, setSelectedMetal } = useMetal();
  const { colors: themeColors } = useTheme();
  const s = useMemo(() => createStyles(themeColors), [themeColors]);
  const [latestGoldPrice, setLatestGoldPrice] = useState<number | null>(null);
  const [latestSilverPrice, setLatestSilverPrice] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState('toz');

  const loadPriceAndSettings = useCallback(async () => {
    const goldPriceData = await getLatestGoldPrice();
    if (goldPriceData) {
      setLatestGoldPrice(goldPriceData.bid);
    }
    const silverPriceData = await getLatestSilverPrice();
    if (silverPriceData) {
      setLatestSilverPrice(silverPriceData.bid);
    }
    if (settings.unit) {
      setWeightUnit(settings.unit);
    }
  }, [settings.unit]);

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
  const currency = settings.currency;

  const rows = [];
  for (let i = 0; i < filteredItems.length; i += 2) {
    rows.push(filteredItems.slice(i, i + 2));
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={[globalStyles.tabPageContainer, { backgroundColor: themeColors.background }]}>
        <PageHeader title="Your Stack" />

        <View style={[toggleStyles.container, { backgroundColor: themeColors.toggleBg }]}>
          <TouchableOpacity
            style={[toggleStyles.option, selectedMetal === 'gold' && { backgroundColor: themeColors.gold }]}
            onPress={() => setSelectedMetal('gold')}
          >
            <Text style={[toggleStyles.optionText, selectedMetal === 'gold' && toggleStyles.optionTextActive]}>Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[toggleStyles.option, selectedMetal === 'silver' && { backgroundColor: themeColors.silver }]}
            onPress={() => setSelectedMetal('silver')}
          >
            <Text style={[toggleStyles.optionText, selectedMetal === 'silver' && toggleStyles.optionTextActive]}>Silver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.gridContainer} contentContainerStyle={s.scrollContent}>
          {filteredItems.length === 0 ? (
            <EmptyStackState />
          ) : (
            <View style={s.grid}>
              {rows.map((row, ri) => (
                <View key={`row-${ri}`} style={s.row}>
                  {row.map(item => (
                    <StackItemCard
                      key={item.id}
                      item={item}
                      latestPrice={latestPrice}
                      currency={currency}
                      weightUnit={weightUnit}
                      onDeleted={handleDeleted}
                      onPress={() => handleEdit(item.id)}
                      metal={selectedMetal}
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

function createStyles(_c: typeof colors) {
  return StyleSheet.create({
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
}
