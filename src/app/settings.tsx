import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { globalStyles, colors } from '@/styles/global';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Linking, Image, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { getUserSettings, updateApiKey, removeApiKey, updatePreference, updateManualPrice as clearManualPrice, updateManualSilverPrice as clearManualSilverPrice, updateManualGoldPremium, updateManualSilverPremium, type UserSettings } from '@/services/settingsService';
import { getAllItems } from '@/services/stackStorage';
import { saveSpotPrice } from '@/services/priceService';
import { saveSilverSpotPrice } from '@/services/silverPriceService';
import { AVAILABLE_CURRENCIES, AVAILABLE_UNITS, METALS_DEV_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { usePrice } from '@/contexts/PriceContext';
import { refreshSettings as refreshPriceSettings } from '@/contexts/PriceContext';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, hasPinSet } = useAuth();
  const { updateManualPrice, updateManualSilverPrice } = usePrice();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    defaultMetal: 'gold',
    manualPrice: null,
    createdAt: '',
    updatedAt: '',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [manualPriceInput, setManualPriceInput] = useState('');
  const [manualSilverPriceInput, setManualSilverPriceInput] = useState('');
  const [manualGoldPremiumInput, setManualGoldPremiumInput] = useState('');
  const [manualSilverPremiumInput, setManualSilverPremiumInput] = useState('');
  const [offGridMode, setOffGridMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStackItems, setHasStackItems] = useState(false);

  useEffect(() => {
    loadSettings();
    checkStackItems();
  }, []);

  async function checkStackItems() {
    try {
      const items = await getAllItems();
      setHasStackItems(items.length > 0);
    } catch (error) {
      console.error('Error checking stack items:', error);
    }
  }

async function loadSettings() {
    try {
      const s = await getUserSettings();
      setSettings(s);
      const hasManual = s.manualPrice !== null && s.manualPrice !== undefined && s.manualPrice > 0;
      const hasSilverManual = s.manualSilverPrice !== null && s.manualSilverPrice !== undefined && s.manualSilverPrice > 0;
      setOffGridMode(hasManual && hasSilverManual);
      if (s.manualPrice) {
        setManualPriceInput(s.manualPrice.toString());
      }
      if (s.manualSilverPrice) {
        setManualSilverPriceInput(s.manualSilverPrice.toString());
      }
      if (s.manualGoldPremium !== null && s.manualGoldPremium !== undefined) {
        setManualGoldPremiumInput(s.manualGoldPremium.toString());
      }
      if (s.manualSilverPremium !== null && s.manualSilverPremium !== undefined) {
        setManualSilverPremiumInput(s.manualSilverPremium.toString());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveApiKey() {
    if (!apiKeyInput.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsSaving(true);
    try {
      await updateApiKey(apiKeyInput.trim());
      setSettings(prev => ({ ...prev, hasApiKey: true }));
      setApiKeyInput('');
      Alert.alert('Success', 'API key saved successfully', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  }

  function handleGoBack() {
    if (offGridMode) {
      router.replace('/guide');
    } else if (settings.hasApiKey) {
      router.replace('/guide');
    } else {
      router.replace('/guide');
    }
  }

  async function handleRemoveApiKey() {
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
              await clearManualPrice(null);
              await clearManualSilverPrice(null);
              await updateManualGoldPremium(null);
              await updateManualSilverPremium(null);
              await saveSpotPrice(0, 0, 0, 0, 0, 0, 0, settings.currency, settings.unit);
              await saveSilverSpotPrice(0, 0, 0, 0, 0, 0, 0, settings.currency, settings.unit);
              setSettings({ currency: 'GBP', unit: 'toz', hasApiKey: false, manualPrice: null, manualSilverPrice: null, manualGoldPremium: null, manualSilverPremium: null, createdAt: '', updatedAt: '' });
              setOffGridMode(false);
              setManualPriceInput('');
              setManualSilverPriceInput('');
              setManualGoldPremiumInput('');
              setManualSilverPremiumInput('');
              Alert.alert('Success', 'API key removed. You can add a new key from Account > Settings.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  }

  async function handleCurrencyChange(currency: string) {
    try {
      await updatePreference('currency', currency);
      setSettings(prev => ({ ...prev, currency }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  }

  async function handleUnitChange(unit: string) {
    try {
      await updatePreference('unit', unit);
      setSettings(prev => ({ ...prev, unit }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit');
    }
  }

  async function handleDefaultMetalChange(metal: string) {
    try {
      await updatePreference('defaultMetal', metal);
      setSettings(prev => ({ ...prev, defaultMetal: metal as 'gold' | 'silver' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update default metal');
    }
  }

  

  function handleManualSilverPriceChange(text: string) {
    setManualSilverPriceInput(text);
  }

  async function handleManualSilverPriceSubmit() {
    const price = parseFloat(manualSilverPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid silver price.');
      return;
    }
    await updateManualSilverPrice(price);
    setSettings(prev => ({ ...prev, manualSilverPrice: price }));
    if (settings.manualPrice && settings.manualPrice > 0) {
      setOffGridMode(true);
    }
  }

  async function handleOffGridModeToggle(value: boolean) {
    if (value && (!settings.manualPrice || settings.manualPrice <= 0 || !settings.manualSilverPrice || settings.manualSilverPrice <= 0)) {
      Alert.alert('Enter Prices First', 'Please enter both gold and silver prices and tap Submit Price for each before enabling off-grid mode.');
      return;
    }
    setOffGridMode(value);
    if (!value) {
      await clearManualPrice(null);
      await clearManualSilverPrice(null);
      await updateManualGoldPremium(null);
      await updateManualSilverPremium(null);
      await saveSpotPrice(0, 0, 0, 0, 0, 0, 0, settings.currency, settings.unit);
      await saveSilverSpotPrice(0, 0, 0, 0, 0, 0, 0, settings.currency, settings.unit);
      setSettings(prev => ({ ...prev, manualPrice: null, manualSilverPrice: null, manualGoldPremium: null, manualSilverPremium: null }));
      setManualPriceInput('');
      setManualSilverPriceInput('');
      setManualGoldPremiumInput('');
      setManualSilverPremiumInput('');
    }
  }

  async function handleManualPriceSubmit() {
    const goldPrice = parseFloat(manualPriceInput);
    const silverPrice = parseFloat(manualSilverPriceInput);
    const goldPremium = manualGoldPremiumInput ? parseFloat(manualGoldPremiumInput) : null;
    const silverPremium = manualSilverPremiumInput ? parseFloat(manualSilverPremiumInput) : null;
    
    if (isNaN(goldPrice) || goldPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid gold price.');
      return;
    }
    if (isNaN(silverPrice) || silverPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid silver price.');
      return;
    }
    
    await updateManualPrice(goldPrice);
    await updateManualSilverPrice(silverPrice);
    if (goldPremium !== null && !isNaN(goldPremium) && goldPremium >= 0) {
      await updateManualGoldPremium(goldPremium);
    }
    if (silverPremium !== null && !isNaN(silverPremium) && silverPremium >= 0) {
      await updateManualSilverPremium(silverPremium);
    }
    setSettings(prev => ({ 
      ...prev, 
      manualPrice: goldPrice, 
      manualSilverPrice: silverPrice,
      manualGoldPremium: goldPremium,
      manualSilverPremium: silverPremium
    }));
    setOffGridMode(true);
    Alert.alert('Success', 'Both gold and silver prices have been saved.');
  }

  function openMetalsDev() {
    Linking.openURL(METALS_DEV_URL);
  }

  if (isLoading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.gold }}>Loading...</Text>
      </View>
    );
  }

return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={globalStyles.container} keyboardShouldPersistTaps="handled">
      <View style={apiStyles.header}>
        <Text style={apiStyles.title}>Settings</Text>
      </View>

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>Currency</Text>
        {hasStackItems && (
          <Text style={apiStyles.notConfiguredText}>Cannot change - items in stack</Text>
        )}
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                apiStyles.optionButton,
                settings.currency === curr.code && apiStyles.optionButtonActive,
                hasStackItems && apiStyles.optionButtonDisabled
              ]}
              onPress={() => !hasStackItems && handleCurrencyChange(curr.code)}
              disabled={hasStackItems}
            >
              <Text style={[
                apiStyles.optionButtonText,
                settings.currency === curr.code && apiStyles.optionButtonTextActive
              ]}>{curr.code} ({curr.symbol})</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>Weight Unit</Text>
        {hasStackItems && (
          <Text style={apiStyles.notConfiguredText}>Cannot change - items in stack</Text>
        )}
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_UNITS.map((u) => (
            <TouchableOpacity
              key={u.code}
              style={[
                apiStyles.optionButton,
                settings.unit === u.code && apiStyles.optionButtonActive,
                hasStackItems && apiStyles.optionButtonDisabled
              ]}
              onPress={() => !hasStackItems && handleUnitChange(u.code)}
              disabled={hasStackItems}
            >
              <Text style={[
                apiStyles.optionButtonText,
                settings.unit === u.code && apiStyles.optionButtonTextActive
              ]}>{u.name} ({u.abbrev})</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>Default Metal</Text>
        <View style={apiStyles.optionsRow}>
          <TouchableOpacity
            style={[
              apiStyles.optionButton,
              settings.defaultMetal === 'gold' && apiStyles.optionButtonActive
            ]}
            onPress={() => handleDefaultMetalChange('gold')}
          >
            <Text style={[
              apiStyles.optionButtonText,
              settings.defaultMetal === 'gold' && apiStyles.optionButtonTextActive
            ]}>Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              apiStyles.optionButton,
              settings.defaultMetal === 'silver' && apiStyles.optionButtonActive
            ]}
            onPress={() => handleDefaultMetalChange('silver')}
          >
            <Text style={[
              apiStyles.optionButtonText,
              settings.defaultMetal === 'silver' && apiStyles.optionButtonTextActive
            ]}>Silver</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>API Key</Text>

        {settings.hasApiKey ? (
          <View style={apiStyles.statusContainer}>
            <Text style={apiStyles.statusText}>API Key configured ✓</Text>
            <TouchableOpacity 
              style={[
                apiStyles.removeButton, 
                (hasPinSet && !isAuthenticated) && apiStyles.removeButtonDisabled
              ]} 
              onPress={handleRemoveApiKey}
              disabled={hasPinSet && !isAuthenticated}
            >
              <Text style={apiStyles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={apiStyles.notConfiguredText}>API key not configured</Text>
            
            <View style={apiStyles.manualPriceContainer}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={apiStyles.label}>Gold Price ({settings.currency}/{settings.unit})</Text>
                  <TextInput
                    style={apiStyles.input}
                    placeholder="Price"
                    placeholderTextColor="#666"
                    value={manualPriceInput}
                    onChangeText={setManualPriceInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 0.6 }}>
                  <Text style={apiStyles.label}>Premium %</Text>
                  <TextInput
                    style={apiStyles.input}
                    placeholder="%"
                    placeholderTextColor="#666"
                    value={manualGoldPremiumInput}
                    onChangeText={setManualGoldPremiumInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={apiStyles.manualPriceContainer}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={apiStyles.label}>Silver Price ({settings.currency}/{settings.unit})</Text>
                  <TextInput
                    style={apiStyles.input}
                    placeholder="Price"
                    placeholderTextColor="#666"
                    value={manualSilverPriceInput}
                    onChangeText={setManualSilverPriceInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 0.6 }}>
                  <Text style={apiStyles.label}>Premium %</Text>
                  <TextInput
                    style={apiStyles.input}
                    placeholder="%"
                    placeholderTextColor="#666"
                    value={manualSilverPremiumInput}
                    onChangeText={setManualSilverPremiumInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[apiStyles.saveButton, (!manualPriceInput || !manualSilverPriceInput) && apiStyles.buttonDisabled]}
              onPress={handleManualPriceSubmit}
              disabled={!manualPriceInput || !manualSilverPriceInput}
            >
              <Text style={apiStyles.saveButtonText}>Submit Prices</Text>
            </TouchableOpacity>

            <View style={[apiStyles.offGridModeContainer, { marginTop: 24 }]}>
              <View style={apiStyles.offGridModeRow}>
                <Text style={apiStyles.offGridModeLabel}>Off Grid Mode</Text>
                <Switch
                  value={offGridMode}
                  onValueChange={handleOffGridModeToggle}
                  trackColor={{ false: colors.themeGrey, true: colors.gold }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {!offGridMode && (
              <>
                <TouchableOpacity style={apiStyles.linkButton} onPress={openMetalsDev}>
                  <Text style={apiStyles.linkButtonText}>Get free API key at metals.dev ↗</Text>
                </TouchableOpacity>
                <TextInput
                  style={apiStyles.input}
                  placeholder="Enter your API key"
                  placeholderTextColor="#666"
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[apiStyles.saveButton, isSaving && apiStyles.buttonDisabled]}
                  onPress={handleSaveApiKey}
                  disabled={isSaving}
                >
                  <Text style={apiStyles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save API Key'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {offGridMode && (
        <TouchableOpacity style={apiStyles.continueButton} onPress={handleGoBack}>
          <Text style={apiStyles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {settings.hasApiKey && (
        <TouchableOpacity style={apiStyles.returnButton} onPress={handleGoBack}>
          <Text style={apiStyles.returnButtonText}>Return</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const apiStyles = {
  header: {
    marginBottom: 10,
  } as const,
  continueButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  } as const,
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as const,
  returnButton: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  } as const,
  returnButtonText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  } as const,
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
  } as const,
  section: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as const,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 16,
  } as const,
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  statusText: {
    fontSize: 14,
    color: '#4caf50',
  } as const,
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
  } as const,
  removeButtonText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '600',
  } as const,
  removeButtonDisabled: {
    opacity: 0.5,
  } as const,
  notConfiguredText: {
    fontSize: 14,
    color: colors.red,
    marginBottom: 12,
  } as const,
  linkButton: {
    marginBottom: 16,
  } as const,
  linkButtonText: {
    fontSize: 14,
    color: colors.white,
    textDecorationLine: 'underline' as const,
  } as const,
  input: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  } as const,
  saveButton: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center' as const,
  } as const,
  saveButtonSilver: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.silver,
  } as const,
  buttonDisabled: {
    opacity: 0.7,
  } as const,
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as const,
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
  } as const,
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as const,
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: colors.themeGrey,
  } as const,
  optionButtonActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '20',
  } as const,
  optionButtonDisabled: {
    borderColor: '#333',
    backgroundColor: '#2a2a2a',
    opacity: 0.5,
  } as const,
  optionButtonText: {
    fontSize: 14,
    color: '#888',
  } as const,
  optionButtonTextActive: {
    color: colors.gold,
    fontWeight: '600' as const,
  } as const,
  optionButtonTextDisabled: {
    color: '#555',
  } as const,
  lockedNote: {
    fontSize: 13,
    color: colors.orange,
    fontStyle: 'italic',
    marginBottom: 16,
    padding: 10,
    backgroundColor: colors.orange + '20',
    borderRadius: 8,
  } as const,
  offGridModeContainer: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  } as const,
  offGridModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  offGridModeLabel: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  } as const,
  offGridModeDescription: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  } as const,
  manualPriceContainer: {
    marginTop: 8,
  } as const,
};
