import { Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserSettings } from '@/services/settingsService';
import { usePrice } from '@/contexts/PriceContext';
import { colors } from '@/styles/global';

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.3 }} />
      <Text style={{ fontSize: 15, fontWeight: '600', color, marginHorizontal: 12, letterSpacing: 0.5 }}>
        {title.toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.3 }} />
    </View>
  );
}

function FeatureCard({ icon, title, desc, iconColor, titleColor, descColor }: { icon: string; title: string; desc: string; iconColor?: string; titleColor?: string; descColor?: string }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 6,
      backgroundColor: colors.themeGrey,
      borderRadius: 10,
    }}>
      <Text style={{ fontSize: 18, marginRight: 12, marginTop: 1, color: iconColor }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: titleColor || colors.white, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 13, lineHeight: 18, color: descColor || colors.lightGrey }}>{desc}</Text>
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const router = useRouter();
  const { isSettingsLoading } = usePrice();
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100, paddingTop: 60 }}>
      {showSetupApiKey && (
        <TouchableOpacity style={{ alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 10 }} onPress={() => router.back()}>
          <Text style={{ color: colors.gold, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <Image source={require('../../assets/images/stackers-logo.png')} style={{ width: 90, height: 40 }} resizeMode="contain" />
        <Text style={{ flex: 1, fontSize: 22, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginRight: 90 }}>Guide</Text>
      </View>

      {showSetupApiKey && (
        <Link href="/settings" asChild>
          <TouchableOpacity style={{ backgroundColor: colors.green, padding: 16, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.gold, fontSize: 18, fontWeight: '600' }}>Set up Options</Text>
          </TouchableOpacity>
        </Link>
      )}

      {showContinue && (
        <TouchableOpacity style={{ backgroundColor: colors.green, padding: 16, borderRadius: 8, marginBottom: 12, alignItems: 'center' }} onPress={handleContinue}>
          <Text style={{ color: colors.gold, fontSize: 18, fontWeight: '600' }}>Continue to App</Text>
        </TouchableOpacity>
      )}

      <SectionHeader title="Getting Started" color={colors.gold} />

      <FeatureCard icon="🏠" title="Home Tab" desc="Price banner, chart, and stack summary. Swipe or tap to switch between gold and silver." />
      <FeatureCard icon="📦" title="Your Stack" desc="All items with current values. Filter by gold or silver, edit or delete items." />
      <FeatureCard icon="📊" title="Portfolio" desc="Detailed breakdown with total value, profit/loss, and premium percentages." />
      <FeatureCard icon="➕" title="Add-2-Stack" desc="Add new items via camera, gallery, or manual entry with photo." />
      <FeatureCard icon="⚙️" title="Account" desc="Settings, PIN management, this guide, and overwrite today's price for gold/silver in off-grid mode." />

      <SectionHeader title="Setup" color={colors.gold} />

      <FeatureCard icon="🔑" title="API Key" desc="Get a free key from metals.dev for live gold and silver prices." />
      <FeatureCard icon="📡" title="Off Grid Mode" desc="Enter gold and silver prices manually without an API key. Overwrite today's price from Account tab." />
      <FeatureCard icon="💱" title="Currency & Unit" desc="Choose GBP, USD, or EUR and troy ounces or grams." />
      <FeatureCard icon="📈" title="Chart Data" desc="12-month price history from Yahoo Finance, converted via Frankfurter exchange rates. Falls back to bundled data if offline." />
      <FeatureCard icon="🏷️" title="Default Metal" desc="Set your preferred metal (gold or silver) for the Home screen." />

      <SectionHeader title="Adding Items" color={colors.gold} />

      <FeatureCard icon="📸" title="Take Photo" desc="Capture an image of your item with the camera." />
      <FeatureCard icon="🖼️" title="From Gallery" desc="Select existing photos from your gallery." />
      <FeatureCard icon="🪙" title="Select Metal" desc="Choose gold or silver for the item you are adding." />
      <FeatureCard icon="✏️" title="Item Details" desc="Enter name, weight, and cost per unit or total amount paid." />
      <FeatureCard icon="✅" title="Submit" desc="Tap to save your item. Add another or view your stack after saving." />

      <SectionHeader title="Your Stack" color={colors.gold} />

      <FeatureCard icon="🔍" title="Filter" desc="Toggle gold or silver to filter items by metal type." />
      <FeatureCard icon="✏️" title="Edit" desc="Tap any item card to edit its details." />
      <FeatureCard icon="🗑️" title="Delete" desc="Tap the X button to remove an item from your stack." />
      <FeatureCard icon="💰" title="Current Value" desc="Each item shows its value calculated as weight × bid price." />
      <FeatureCard icon="📊" title="Totals" desc="Total value and total cost displayed at the bottom of the list." />

      <SectionHeader title="Home Tab" color={colors.gold} />

      <FeatureCard icon="🔄" title="Metal Toggle" desc="Swipe or tap to switch between gold and silver views." />
      <FeatureCard icon="💵" title="Price Banner" desc="Live price from API or your entered manual price in Off Grid mode." />
      <FeatureCard icon="📉" title="Price Chart" desc="Rolling 12-month price history chart with daily data." />
      <FeatureCard icon="💎" title="Stack Value" desc="Tap the stack value block to navigate to Your Stack screen." />

      <SectionHeader title="Portfolio Tab" color={colors.gold} />

      <FeatureCard icon="💹" title="Total Value" desc="Overall portfolio value with profit and loss calculation." />
      <FeatureCard icon="🥇" title="Gold Section" desc="Items, total weight, value, cost, and profit for gold holdings." />
      <FeatureCard icon="🥈" title="Silver Section" desc="Items, total weight, value, cost, and profit for silver holdings." />
      <FeatureCard icon="💲" title="Premium" desc="Bid price and premium percentage displayed for each metal." />

      <SectionHeader title="Security (PIN)" color={colors.gold} />

      <FeatureCard icon="🔐" title="Set PIN" desc="Go to Account tab and tap Set PIN to create a 4-digit PIN." />
      <FeatureCard icon="🔒" title="App Lock" desc="PIN is required every time the app launches." />
      <FeatureCard icon="⏱️" title="Lockout" desc="After 5 failed attempts, the app locks with increasing lockout times." />
      <FeatureCard icon="🔄" title="Manage PIN" desc="Change or remove PIN from Account. PIN required to remove API key." />
      <Link href="/security-statement" asChild>
        <TouchableOpacity style={{ marginTop: 4, paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, color: colors.gold, textDecorationLine: 'underline' }}>View Security Statement →</Text>
        </TouchableOpacity>
      </Link>

      <SectionHeader title="Navigation" color={colors.gold} />

      <FeatureCard icon="📱" title="Tab Bar" desc="Five tabs: Home, Your Stack, Portfolio, Add-2-Stack, and Account." />
      <FeatureCard icon="👆" title="Swipe" desc="Swipe left or right on any tab to navigate between screens." />

      <View style={{ marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderDark, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: colors.grey, marginBottom: 4 }}>coded by this.me</Text>
        <Text style={{ fontSize: 11, color: colors.grey }}>© {new Date().getFullYear()} — MIT License</Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}
