import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserSettings } from '@/services/settingsService';
import { usePrice } from '@/contexts/PriceContext';

export default function GuideScreen() {
  const router = useRouter();
  const { isSettingsLoading, refreshSettings } = usePrice();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [offGridMode, setOffGridMode] = useState(false);

  useEffect(() => {
    getUserSettings().then(s => {
      setHasApiKey(s.hasApiKey);
      const hasManual = s.manualPrice !== null && s.manualPrice !== undefined && !isNaN(s.manualPrice);
      setOffGridMode(hasManual);
    });
  }, []);

  const handleContinue = () => {
    if (!isSettingsLoading && (hasApiKey || offGridMode)) {
      router.replace('/');
    }
  };

  const showSetupApiKey = !hasApiKey && !offGridMode;
  const showContinue = hasApiKey || offGridMode;

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {showSetupApiKey && (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>How to Use Stackers</Text>
      </View>

      {showSetupApiKey && (
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.apiButton}>
            <Text style={globalStyles.buttonText}>Set up Options</Text>
          </TouchableOpacity>
        </Link>
      )}

      {showContinue && (
        <TouchableOpacity style={styles.apiButton} onPress={handleContinue}>
          <Text style={globalStyles.buttonText}>Continue to App</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setup</Text>
        <Text style={styles.listItem}>• Get a free API key from <Text style={styles.link}>metals.dev</Text> for live gold & silver prices</Text>
        <Text style={styles.listItem}>• Or use Off Grid mode to enter Gold and Silver prices manually</Text>
        <Text style={styles.listItem}>• Choose currency (GBP, USD, EUR) and weight unit (troy oz or grams)</Text>
        <Text style={styles.listItem}>• Set your default metal (Gold or Silver) for the Home screen</Text>
        <Text style={styles.note}>Tip: Once you add items, currency and unit cannot be changed. Delete all items first to change them.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adding Items</Text>
        <Text style={styles.text}>In the Add-2-Stack tab:</Text>
        <Text style={styles.listItem}>• Take Photo - capture an image with camera</Text>
        <Text style={styles.listItem}>• Select from Gallery - choose existing photos</Text>
        <Text style={styles.listItem}>• Select Metal - Gold or Silver for this item</Text>
        <Text style={styles.listItem}>• Enter Item name (e.g. "Gold Sovereign Coin")</Text>
        <Text style={styles.listItem}>• Enter Weight in your chosen unit</Text>
        <Text style={styles.listItem}>• Enter Cost per unit OR Total amount paid</Text>
        <Text style={styles.listItem}>• Tap Submit to save</Text>
        <Text style={styles.note}>You can add another item or view your stack after saving.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stack</Text>
        <Text style={styles.text}>View all items in the Your Stack tab:</Text>
        <Text style={styles.listItem}>• Toggle Gold/Silver to filter items by metal</Text>
        <Text style={styles.listItem}>• Tap any item card to edit it</Text>
        <Text style={styles.listItem}>• Tap the X button to delete an item</Text>
        <Text style={styles.listItem}>• See current value for each item (weight × bid price)</Text>
        <Text style={styles.listItem}>• Total value and total cost displayed at bottom</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Home Tab</Text>
        <Text style={styles.text}>The Home screen shows:</Text>
        <Text style={styles.listItem}>• Gold/Silver toggle - swipe or tap to switch</Text>
        <Text style={styles.listItem}>• Price banner - live price (API) or your entered price (Off Grid)</Text>
        <Text style={styles.listItem}>• Price history chart - rolling 12 months of data</Text>
        <Text style={styles.listItem}>• Stack Value block - tap to go to Your Stack screen</Text>
        <Text style={styles.note}>In Off Grid mode, tap "Update Price" on the banner to enter new manual prices for Gold and Silver separately.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Tab</Text>
        <Text style={styles.text}>Detailed portfolio breakdown:</Text>
        <Text style={styles.listItem}>• Total value with profit/loss calculation</Text>
        <Text style={styles.listItem}>• Gold section - items, total weight, value, cost, profit</Text>
        <Text style={styles.listItem}>• Silver section - items, total weight, value, cost, profit</Text>
        <Text style={styles.listItem}>• Bid price and premium % for each metal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security (PIN)</Text>
        <Text style={styles.listItem}>• Go to Account tab, tap "Set PIN"</Text>
        <Text style={styles.listItem}>• Enter a 4-digit PIN, then confirm it</Text>
        <Text style={styles.listItem}>• App requires PIN on every launch</Text>
        <Text style={styles.listItem}>• After 5 failed attempts, app locks for 5 minutes with increasing lockout times</Text>
        <Text style={styles.note}>You can Change or Remove PIN from the Account tab. PIN is required to remove API key.</Text>
        <Link href="/security-statement" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>View Security Statement →</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <Text style={styles.text}>Tabs:</Text>
        <Text style={styles.listItem}>• Home - price banner, chart, stack summary</Text>
        <Text style={styles.listItem}>• Your Stack - all items with values</Text>
        <Text style={styles.listItem}>• Portfolio - detailed profit/loss breakdown</Text>
        <Text style={styles.listItem}>• Add-2-Stack - add new items</Text>
        <Text style={styles.listItem}>• Account - settings, PIN, guide</Text>
        <Text style={styles.note}>Tip: Swipe left/right on any tab to navigate between tabs.</Text>
      </View>

      <Text style={styles.credit}>coded by this.me</Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backText: {
    color: colors.gold,
    fontSize: 16,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  section: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 12,
    marginTop: 6,
  },
  text: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 6,
  },
  link: {
    color: colors.white,
    textDecorationLine: 'underline',
  },
  credit: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  apiButton: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
