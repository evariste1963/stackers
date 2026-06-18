import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { globalStyles, toggleStyles, colors } from '@/styles/global';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Linking, Switch, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { getUserSettings, updateApiKey, removeApiKey, updatePreference, updateManualPrice, updateManualSilverPrice, updateManualGoldPremium, updateManualSilverPremium, type UserSettings } from '@/services/settingsService';
import { getAllItems } from '@/services/stackStorage';
import { saveGoldSpotPrice, saveSilverSpotPrice } from '@/services/metalPriceService';
import { AVAILABLE_CURRENCIES, AVAILABLE_UNITS, METALPRICE_API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { usePrice } from '@/contexts/PriceContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, hasPinSet } = useAuth();
  const { updateManualPrice: setManualPriceCtx, updateManualSilverPrice: setManualSilverPriceCtx, refreshHistoryForCurrency, refreshSettings } = usePrice();
  const { colors: themeColors, theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    defaultMetal: 'gold',
    manualPrice: null,
    createdAt: '',
    updatedAt: '',
  });
  const [manualInputs, setManualInputs] = useState({ gold: '', silver: '', goldPremium: '', silverPremium: '' });
  const [offGridMode, setOffGridMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStackItems, setHasStackItems] = useState(false);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    loadSettings();
    checkStackItems();
  }, []);

  const checkStackItems = useCallback(async () => {
    try {
      const items = await getAllItems();
      setHasStackItems(items.length > 0);
    } catch (error) {
      console.error('Error checking stack items:', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const s = await getUserSettings();
      setSettings(s);
      const hasGold = s.manualPrice !== null && s.manualPrice !== undefined && s.manualPrice > 0;
      const hasSilver = s.manualSilverPrice !== null && s.manualSilverPrice !== undefined && s.manualSilverPrice > 0;
      setOffGridMode(hasGold && hasSilver);
      if (s.manualPrice) setManualInputs(prev => ({ ...prev, gold: s.manualPrice!.toString() }));
      if (s.manualSilverPrice) setManualInputs(prev => ({ ...prev, silver: s.manualSilverPrice!.toString() }));
      if (s.manualGoldPremium != null) setManualInputs(prev => ({ ...prev, goldPremium: s.manualGoldPremium!.toString() }));
      if (s.manualSilverPremium != null) setManualInputs(prev => ({ ...prev, silverPremium: s.manualSilverPremium!.toString() }));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllPrices = useCallback(async () => {
    const { currency, unit } = settingsRef.current;
    await Promise.all([
      updateManualPrice(null),
      updateManualSilverPrice(null),
      updateManualGoldPremium(null),
      updateManualSilverPremium(null),
      saveGoldSpotPrice(0, 0, 0, 0, 0, 0, 0, currency, unit),
      saveSilverSpotPrice(0, 0, 0, 0, 0, 0, 0, currency, unit),
    ]);
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    const key = manualInputs.gold.trim();
    if (!key) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }
    setIsSaving(true);
    try {
      await updateApiKey(key);
      await refreshSettings();
      setSettings(prev => ({ ...prev, hasApiKey: true }));
      setManualInputs(prev => ({ ...prev, gold: '' }));
      Alert.alert('Success', 'API key saved successfully', [
        { text: 'OK', onPress: () => router.replace('/guide') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  }, [manualInputs.gold, router]);

  const handleRemoveApiKey = useCallback(() => {
    if (hasPinSet && !isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in with your PIN to remove the API key.');
      return;
    }
    const message = offGridMode
      ? 'Your manual gold and silver prices will be kept. You can still use the app with manual prices.'
      : 'You can add manual gold and silver prices to continue using the app without an API key.';
    Alert.alert(
      'Remove API Key',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeApiKey();
              await clearAllPrices();
              setSettings({ currency: 'GBP', unit: 'toz', hasApiKey: false, defaultMetal: 'gold', manualPrice: null, manualSilverPrice: null, manualGoldPremium: null, manualSilverPremium: null, createdAt: '', updatedAt: '' });
              setOffGridMode(false);
              setManualInputs({ gold: '', silver: '', goldPremium: '', silverPremium: '' });
              Alert.alert('Success', 'API key removed. You can add a new key from Account > Settings.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  }, [hasPinSet, isAuthenticated, offGridMode, clearAllPrices]);

  const handleCurrencyChange = useCallback(async (currency: string) => {
    try {
      await updatePreference('currency', currency);
      setSettings(prev => ({ ...prev, currency }));
      refreshHistoryForCurrency(currency);
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  }, [refreshHistoryForCurrency]);

  const handleUnitChange = useCallback(async (unit: string) => {
    try {
      await updatePreference('unit', unit);
      setSettings(prev => ({ ...prev, unit }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit');
    }
  }, []);

  const handleDefaultMetalChange = useCallback(async (metal: string) => {
    try {
      await updatePreference('defaultMetal', metal);
      setSettings(prev => ({ ...prev, defaultMetal: metal as 'gold' | 'silver' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update default metal');
    }
  }, []);

  const handleManualPriceSubmit = useCallback(async () => {
    const goldPrice = parseFloat(manualInputs.gold);
    const silverPrice = parseFloat(manualInputs.silver);
    if (isNaN(goldPrice) || goldPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid gold price.');
      return;
    }
    if (isNaN(silverPrice) || silverPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid silver price.');
      return;
    }
    const goldPremium = manualInputs.goldPremium ? parseFloat(manualInputs.goldPremium) : null;
    const silverPremium = manualInputs.silverPremium ? parseFloat(manualInputs.silverPremium) : null;
    Alert.alert(
      'Confirm Prices',
      `Gold: ${goldPrice} ${settings.currency}/${settings.unit}\nSilver: ${silverPrice} ${settings.currency}/${settings.unit}${goldPremium != null ? `\nGold Premium: ${goldPremium}%` : ''}${silverPremium != null ? `\nSilver Premium: ${silverPremium}%` : ''}\n\nEnable Off Grid Mode with these prices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (goldPremium != null && !isNaN(goldPremium) && goldPremium >= 0) await updateManualGoldPremium(goldPremium);
            if (silverPremium != null && !isNaN(silverPremium) && silverPremium >= 0) await updateManualSilverPremium(silverPremium);
            await setManualPriceCtx(goldPrice);
            await setManualSilverPriceCtx(silverPrice);
            setSettings(prev => ({ ...prev, manualPrice: goldPrice, manualSilverPrice: silverPrice, manualGoldPremium: goldPremium ?? null, manualSilverPremium: silverPremium ?? null }));
            setOffGridMode(true);
            Alert.alert('Success', 'Both gold and silver prices have been saved.');
          },
        },
      ]
    );
  }, [manualInputs, settings.currency, settings.unit, setManualPriceCtx, setManualSilverPriceCtx]);

  const handleOffGridModeToggle = useCallback(async (value: boolean) => {
    if (value && (!settings.manualPrice || settings.manualPrice <= 0 || !settings.manualSilverPrice || settings.manualSilverPrice <= 0)) {
      Alert.alert('Enter Prices First', 'Please enter both gold and silver prices and tap Submit Price for each before enabling off-grid mode.');
      return;
    }
    setOffGridMode(value);
    if (!value) {
      await clearAllPrices();
      setSettings(prev => ({ ...prev, manualPrice: null, manualSilverPrice: null, manualGoldPremium: null, manualSilverPremium: null }));
      setManualInputs({ gold: '', silver: '', goldPremium: '', silverPremium: '' });
    }
  }, [settings.manualPrice, settings.manualSilverPrice, clearAllPrices]);

  const openMetalpriceApi = useCallback(() => {
    Linking.openURL(METALPRICE_API_URL);
  }, []);

  const hasGold = useMemo(() => !!manualInputs.gold.trim(), [manualInputs.gold]);
  const hasSilver = useMemo(() => !!manualInputs.silver.trim(), [manualInputs.silver]);

  if (isLoading) {
    return (
      <View style={[globalStyles.container, localStyles.loadingContainer]}>
        <Text style={{ color: colors.gold }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={[globalStyles.container, { backgroundColor: themeColors.background }]} keyboardShouldPersistTaps="handled">
        <View style={localStyles.header}>
          <Text style={[localStyles.title, { color: colors.gold }]}>Settings</Text>
        </View>

        <View style={[globalStyles.settingsSection, { backgroundColor: themeColors.themeGrey }]}>
          <View style={localStyles.switchRow}>
            <Text style={[localStyles.switchLabel, { color: themeColors.text }]}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: themeColors.toggleBg, true: colors.gold }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={[globalStyles.settingsSection, { backgroundColor: themeColors.themeGrey }]}>
          <Text style={globalStyles.settingsSectionTitle}>Currency</Text>
          {hasStackItems && (
            <Text style={[localStyles.notConfiguredText, { color: themeColors.red }]}>Cannot change - items in stack</Text>
          )}
          <View style={localStyles.optionsRow}>
            {AVAILABLE_CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[toggleStyles.optionButton, { backgroundColor: themeColors.themeGrey, borderColor: themeColors.borderMid }, settings.currency === curr.code && toggleStyles.optionButtonActive, hasStackItems && localStyles.optionDisabled]}
                onPress={() => !hasStackItems && handleCurrencyChange(curr.code)}
                disabled={hasStackItems}
              >
                <Text style={[toggleStyles.optionButtonText, { color: themeColors.grey }, settings.currency === curr.code && toggleStyles.optionButtonTextActive]}>{curr.code} ({curr.symbol})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[globalStyles.settingsSection, { backgroundColor: themeColors.themeGrey }]}>
          <Text style={globalStyles.settingsSectionTitle}>Weight Unit</Text>
          {hasStackItems && (
            <Text style={[localStyles.notConfiguredText, { color: themeColors.red }]}>Cannot change - items in stack</Text>
          )}
          <View style={localStyles.optionsRow}>
            {AVAILABLE_UNITS.map((u) => (
              <TouchableOpacity
                key={u.code}
                style={[toggleStyles.optionButton, { backgroundColor: themeColors.themeGrey, borderColor: themeColors.borderMid }, settings.unit === u.code && toggleStyles.optionButtonActive, hasStackItems && localStyles.optionDisabled]}
                onPress={() => !hasStackItems && handleUnitChange(u.code)}
                disabled={hasStackItems}
              >
                <Text style={[toggleStyles.optionButtonText, { color: themeColors.grey }, settings.unit === u.code && toggleStyles.optionButtonTextActive]}>{u.name} ({u.abbrev})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[globalStyles.settingsSection, { backgroundColor: themeColors.themeGrey }]}>
          <Text style={globalStyles.settingsSectionTitle}>Default Metal</Text>
          <View style={localStyles.optionsRow}>
            <TouchableOpacity
              style={[toggleStyles.optionButton, { backgroundColor: themeColors.themeGrey, borderColor: themeColors.borderMid }, settings.defaultMetal === 'gold' && toggleStyles.optionButtonActive]}
              onPress={() => handleDefaultMetalChange('gold')}
            >
              <Text style={[toggleStyles.optionButtonText, { color: themeColors.grey }, settings.defaultMetal === 'gold' && toggleStyles.optionButtonTextActive]}>Gold</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[toggleStyles.optionButton, { backgroundColor: themeColors.themeGrey, borderColor: themeColors.borderMid }, settings.defaultMetal === 'silver' && toggleStyles.optionButtonActive]}
              onPress={() => handleDefaultMetalChange('silver')}
            >
              <Text style={[toggleStyles.optionButtonText, { color: themeColors.grey }, settings.defaultMetal === 'silver' && toggleStyles.optionButtonTextActive]}>Silver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[globalStyles.settingsSection, { backgroundColor: themeColors.themeGrey }]}>
          <Text style={globalStyles.settingsSectionTitle}>API Key</Text>

          {settings.hasApiKey ? (
            <View style={localStyles.statusContainer}>
              <Text style={[localStyles.statusText, { color: themeColors.changeGreen }]}>API Key configured ✓</Text>
              <TouchableOpacity
                style={[localStyles.removeButton, { borderColor: themeColors.red }, (hasPinSet && !isAuthenticated) && localStyles.removeDisabled]}
                onPress={handleRemoveApiKey}
                disabled={hasPinSet && !isAuthenticated}
              >
                <Text style={[localStyles.removeButtonText, { color: themeColors.red }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={localStyles.priceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.inputLabel}>Gold Price ({settings.currency}/{settings.unit})</Text>
                  <TextInput
                    style={[globalStyles.input, { backgroundColor: themeColors.themeGrey, color: themeColors.text, borderColor: themeColors.borderMid }]}
                    placeholder="Price"
                    placeholderTextColor={themeColors.lightGrey}
                    value={manualInputs.gold}
                    onChangeText={(v) => setManualInputs(prev => ({ ...prev, gold: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 0.6 }}>
                  <Text style={globalStyles.inputLabel}>Premium %</Text>
                  <TextInput
                    style={[globalStyles.input, { backgroundColor: themeColors.themeGrey, color: themeColors.text, borderColor: themeColors.borderMid }]}
                    placeholder="%"
                    placeholderTextColor={themeColors.lightGrey}
                    value={manualInputs.goldPremium}
                    onChangeText={(v) => setManualInputs(prev => ({ ...prev, goldPremium: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={localStyles.priceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.inputLabel}>Silver Price ({settings.currency}/{settings.unit})</Text>
                  <TextInput
                    style={[globalStyles.input, { backgroundColor: themeColors.themeGrey, color: themeColors.text, borderColor: themeColors.borderMid }]}
                    placeholder="Price"
                    placeholderTextColor={themeColors.lightGrey}
                    value={manualInputs.silver}
                    onChangeText={(v) => setManualInputs(prev => ({ ...prev, silver: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 0.6 }}>
                  <Text style={globalStyles.inputLabel}>Premium %</Text>
                  <TextInput
                    style={[globalStyles.input, { backgroundColor: themeColors.themeGrey, color: themeColors.text, borderColor: themeColors.borderMid }]}
                    placeholder="%"
                    placeholderTextColor={themeColors.lightGrey}
                    value={manualInputs.silverPremium}
                    onChangeText={(v) => setManualInputs(prev => ({ ...prev, silverPremium: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[localStyles.saveButton, { backgroundColor: colors.gold }, (!hasGold || !hasSilver) && localStyles.buttonDisabled]}
                onPress={handleManualPriceSubmit}
                disabled={!hasGold || !hasSilver}
              >
                <Text style={[localStyles.saveButtonText, { color: colors.white }]}>Submit Prices</Text>
              </TouchableOpacity>

              <View style={[localStyles.offGridContainer, { backgroundColor: themeColors.themeGrey, borderColor: colors.gold }]}>
                <View style={localStyles.offGridRow}>
                  <Text style={[localStyles.offGridLabel, { color: colors.gold }]}>Off Grid Mode</Text>
                  <Switch
                    value={offGridMode}
                    onValueChange={handleOffGridModeToggle}
                    trackColor={{ false: themeColors.toggleBg, true: colors.gold }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>

              {!offGridMode && (
                <>
                  <TouchableOpacity style={localStyles.linkButton} onPress={openMetalpriceApi}>
                    <Text style={[localStyles.linkButtonText, { color: themeColors.text }]}>Get free API key at metalpriceapi.com ↗</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[globalStyles.input, { backgroundColor: themeColors.themeGrey, color: themeColors.text, borderColor: themeColors.borderMid }]}
                    placeholder="Enter your API key"
                    placeholderTextColor={themeColors.lightGrey}
                    value={manualInputs.gold}
                    onChangeText={(v) => setManualInputs(prev => ({ ...prev, gold: v }))}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[localStyles.saveButton, { backgroundColor: colors.gold }, isSaving && localStyles.buttonDisabled]}
                    onPress={handleSaveApiKey}
                    disabled={isSaving}
                  >
                    <Text style={[localStyles.saveButtonText, { color: colors.white }]}>
                      {isSaving ? 'Saving...' : 'Save API Key'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {(offGridMode || settings.hasApiKey) && (
          <TouchableOpacity style={[localStyles.continueButton, { backgroundColor: colors.gold }]} onPress={() => router.replace('/guide')}>
            <Text style={[localStyles.continueButtonText, { color: colors.white }]}>Continue</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
  },
  notConfiguredText: {
    fontSize: 14,
    color: colors.red,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.changeGreen,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
  },
  removeButtonText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '600',
  },
  removeDisabled: {
    opacity: 0.5,
  },
  linkButton: {
    marginBottom: 16,
  },
  linkButtonText: {
    fontSize: 14,
    color: colors.white,
    textDecorationLine: 'underline',
  },
  saveButton: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  offGridContainer: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  offGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offGridLabel: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});