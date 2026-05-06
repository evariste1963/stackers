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
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.text}>On first launch, the app will prompt you to set up an API key or use manual prices.</Text>
        
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.text}>Option A: Get a free API key from <Text style={styles.link}>metals.dev</Text> for live gold prices.</Text>
        
        <Text style={styles.stepNumber}>3</Text>
        <Text style={styles.text}>Option B: Toggle "Off Grid mode" to enter gold prices manually instead.</Text>
        
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.text}>Choose your preferred currency (GBP, USD, or EUR) and weight unit (troy ounces, grams, or kg).</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Using Manual Prices</Text>
        <Text style={styles.text}>If you choose Off Grid mode:</Text>
        <Text style={styles.listItem}>• Enter your gold price in the Settings screen</Text>
        <Text style={styles.listItem}>• Tap "Submit Price" to save</Text>
        <Text style={styles.listItem}>• On the home screen, tap "Update Price" to enter a new price</Text>
        <Text style={styles.listItem}>• The app automatically tracks day high and low prices - high updates when you enter a higher price, low updates when you enter a lower price</Text>
        <Text style={styles.listItem}>• Change and change % are calculated based on the previous vs new price</Text>
        <Text style={styles.note}>Tip: If you switch between API and manual modes, the high/low prices sync automatically.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setting Up Security (PIN)</Text>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.text}>Go to the Account tab.</Text>
        
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.text}>Tap "Set PIN" to create a 4-digit PIN.</Text>
        
        <Text style={styles.stepNumber}>3</Text>
        <Text style={styles.text}>Enter your PIN twice to confirm it.</Text>
        
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.text}>The app will now require your PIN every time you open it.</Text>
        
        <Text style={styles.note}>Note: You can change or remove your PIN anytime from the Account tab.</Text>
        
        <Link href="/security-statement" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>View Security Statement →</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adding Items to Your Stack</Text>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.text}>Navigate to the "Add" tab at the bottom of the screen.</Text>
        
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.text}>Optionally, tap "Take Photo" to capture an image of your item (great for keeping records).</Text>
        
        <Text style={styles.stepNumber}>3</Text>
        <Text style={styles.text}>Enter the Item name (e.g., "American Gold Eagle 1oz").</Text>
        
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.text}>Enter the weight of the item in your chosen unit.</Text>
        
        <Text style={styles.stepNumber}>5</Text>
        <Text style={styles.text}>Enter the cost. Choose ONE option:</Text>
        <Text style={styles.listItem}>• Cost per unit: the price you paid per ounce/gram</Text>
        <Text style={styles.listItem}>• Total amount: the total price you paid for the item</Text>
        
        <Text style={styles.stepNumber}>6</Text>
        <Text style={styles.text}>Tap "Submit" to save the item.</Text>
        
        <Text style={styles.stepNumber}>7</Text>
        <Text style={styles.text}>Choose to add another item or view your stack.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Editing & Deleting Items</Text>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.text}>Navigate to the "Your Stack" tab.</Text>
        
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.text}>Tap anywhere on an item card to edit it.</Text>
        
        <Text style={styles.stepNumber}>3</Text>
        <Text style={styles.text}>The Add to Stack screen will open with your item's details pre-filled. Tap "Update" to save your changes.</Text>
        
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.text}>To delete an item, tap the "X" button in the top-right corner of the item card.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viewing Your Portfolio</Text>
        <Text style={styles.text}>The Home tab displays:</Text>
        <Text style={styles.listItem}>• Gold price banner with price and 24h change</Text>
        <Text style={styles.listItem}>• In API mode: Live price from the API</Text>
        <Text style={styles.listItem}>• In manual mode: Your entered price with calculated change</Text>
        <Text style={styles.listItem}>• Price history chart</Text>
        <Text style={styles.listItem}>• Grid showing all your items with current values</Text>
        <Text style={styles.listItem}>• Total stack value and total cost</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Swipe Between Tabs</Text>
        <Text style={styles.text}>You can swipe left or right on any tab screen to navigate between tabs:</Text>
        <Text style={styles.listItem}>• Swipe left = go to next tab</Text>
        <Text style={styles.listItem}>• Swipe right = go to previous tab</Text>
        <Text style={styles.note}>Tip: Swipe quickly or with enough distance for best results.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Managing Settings</Text>
        <Text style={styles.text}>From the Account tab, you can:</Text>
        <Text style={styles.listItem}>• Access Settings to change currency, weight unit, or update your API key</Text>
        <Text style={styles.listItem}>• Change your PIN</Text>
        <Text style={styles.listItem}>• Remove your PIN</Text>
        <Text style={styles.listItem}>• Log out</Text>
        <Text style={styles.note}>Note: To remove the API key, you must be logged in with your PIN if one is set.</Text>
        
        <Text style={styles.note}>
          Important: Once you add items to your stack, the currency and unit preferences become locked. 
          This prevents mismatched calculations when you have existing items. To change currency or unit, 
          you must first remove all items from your stack (Your Stack tab, tap each item and delete).
        </Text>
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
    fontSize: 28,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 16,
    marginTop: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkGold,
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    marginLeft: 12,
  },
  note: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 8,
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