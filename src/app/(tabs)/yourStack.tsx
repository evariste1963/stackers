import { globalStyles } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getAllItems, type StackItem } from '@/services/stackStorage';
import { getLatestPrice, getUserSettings } from '@/services/goldPriceStorage';
import StackItemCard from '@/components/StackItemCard';
import EmptyStackState from '@/components/EmptyStackState';

export default function YourStackScreen() {
  const [items, setItems] = useState<StackItem[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState('GBP');

  const loadItems = useCallback(async () => {
    const all = await getAllItems();
    setItems(all);
  }, []);

  const loadPriceAndSettings = useCallback(async () => {
    const priceData = await getLatestPrice();
    if (priceData) {
      setLatestPrice(priceData.price);
      setCurrency(priceData.currency);
    }
    const settings = await getUserSettings();
    if (settings.currency) {
      setCurrency(settings.currency);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
      loadPriceAndSettings();
    }, [loadItems, loadPriceAndSettings])
  );

  const handleDeleted = useCallback(() => {
    loadItems();
  }, [loadItems]);

  const rows: StackItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Your Stack</Text>
      </View>

      <ScrollView style={styles.gridContainer} contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
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
                    onDeleted={handleDeleted}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
