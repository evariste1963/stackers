import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { globalStyles, colors } from '@/styles/global';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Linking, Image, Switch } from 'react-native';
import { getUserSettings, updateApiKey, removeApiKey, updatePreference, updateManualPrice as clearManualPrice, type UserSettings } from '@/services/settingsService';
import { getAllItems } from '@/services/stackStorage';
import { saveSpotPrice } from '@/services/priceService';
import { AVAILABLE_CURRENCIES, AVAILABLE_UNITS, METALS_DEV_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { usePrice } from '@/contexts/PriceContext';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, hasPinSet } = useAuth();
  const { updateManualPrice } = usePrice();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    manualPrice: null,
    createdAt: '',
    updatedAt: '',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [manualPriceInput, setManualPriceInput] = useState('');
  const [runWithoutApiKey, setRunWithoutApiKey] = useState(false);
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
      setRunWithoutApiKey(hasManual);
      if (s.manualPrice) {
        setManualPriceInput(s.manualPrice.toString());
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
    if (runWithoutApiKey) {
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
    const message = runWithoutApiKey 
      ? 'Your manual price will be kept. You can still use the app with manual prices.'
      : 'You can add a manual price to continue using the app without an API key.';
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
              setSettings({ currency: 'GBP', unit: 'toz', hasApiKey: false, manualPrice: null, createdAt: '', updatedAt: '' });
              setRunWithoutApiKey(false);
              setManualPriceInput('');
              Alert.alert('Success', 'API key removed. You can add a new key from Account > API Settings.');
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

  async function handleRunWithoutApiKeyToggle(value: boolean) {
    if (value && (!settings.manualPrice || settings.manualPrice <= 0)) {
      Alert.alert('Enter Price First', 'Please enter a gold price and tap Submit Price first.');
      return;
    }
    setRunWithoutApiKey(value);
    if (!value) {
      await clearManualPrice(null);
      await saveSpotPrice(0, 0, 0, 0, 0, 0, 0, settings.currency, settings.unit);
      setSettings(prev => ({ ...prev, manualPrice: null }));
      setManualPriceInput('');
    }
  }

  async function handleManualPriceChange(text: string) {
    setManualPriceInput(text);
  }

  async function handleManualPriceSubmit() {
    const price = parseFloat(manualPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid gold price.');
      return;
    }
    await updateManualPrice(price);
    setSettings(prev => ({ ...prev, manualPrice: price }));
    setRunWithoutApiKey(true);
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
    <ScrollView style={globalStyles.container}>
      <View style={apiStyles.header}>
        <Text style={apiStyles.title}>API Settings</Text>
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
            
            <View style={apiStyles.runWithoutApiKeyContainer}>
              <View style={apiStyles.runWithoutApiKeyRow}>
                <Text style={apiStyles.runWithoutApiKeyLabel}>Run without API-Key</Text>
                <Switch
                  value={runWithoutApiKey}
                  onValueChange={handleRunWithoutApiKeyToggle}
                  trackColor={{ false: colors.themeGrey, true: colors.gold }}
                  thumbColor={runWithoutApiKey ? colors.white : colors.white}
                />
              </View>
              <Text style={apiStyles.runWithoutApiKeyDescription}>
                Enter gold price manually instead of fetching live data
              </Text>
            </View>

            <View style={apiStyles.manualPriceContainer}>
              <Text style={apiStyles.label}>Manual Gold Price ({settings.currency}/{settings.unit})</Text>
              <TextInput
                style={apiStyles.input}
                placeholder="Enter gold price"
                placeholderTextColor="#666"
                value={manualPriceInput}
                onChangeText={setManualPriceInput}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[apiStyles.saveButton, !manualPriceInput && apiStyles.buttonDisabled]}
                onPress={handleManualPriceSubmit}
                disabled={!manualPriceInput}
              >
                <Text style={apiStyles.saveButtonText}>Submit Price</Text>
              </TouchableOpacity>
            </View>

            {!runWithoutApiKey && (
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

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>Preferences</Text>

        {/* Currency and unit cannot be changed while stack has items - see guide.tsx for details */}
        {hasStackItems && (
          <Text style={apiStyles.lockedNote}>
            Currency and unit are locked because you have items in your stack. Remove all items to change preferences.
          </Text>
        )}

        <Text style={apiStyles.label}>Currency</Text>
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_CURRENCIES.map((curr) => {
            const isActive = settings.currency === curr.code;
            const isDisabled = hasStackItems && !isActive;
            return (
              <TouchableOpacity
                key={curr.code}
                style={[
                  apiStyles.optionButton,
                  isActive && apiStyles.optionButtonActive,
                  isDisabled && apiStyles.optionButtonDisabled,
                ]}
                onPress={() => !isDisabled && handleCurrencyChange(curr.code)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    apiStyles.optionButtonText,
                    isActive && apiStyles.optionButtonTextActive,
                    isDisabled && apiStyles.optionButtonTextDisabled,
                  ]}
                >
                  {curr.code} ({curr.symbol})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={apiStyles.label}>Unit</Text>
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_UNITS.map((u) => {
            const isActive = settings.unit === u.code;
            const isDisabled = hasStackItems && !isActive;
            return (
              <TouchableOpacity
                key={u.code}
                style={[
                  apiStyles.optionButton,
                  isActive && apiStyles.optionButtonActive,
                  isDisabled && apiStyles.optionButtonDisabled,
                ]}
                onPress={() => !isDisabled && handleUnitChange(u.code)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    apiStyles.optionButtonText,
                    isActive && apiStyles.optionButtonTextActive,
                    isDisabled && apiStyles.optionButtonTextDisabled,
                  ]}
                >
                  {u.name} ({u.abbrev})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {runWithoutApiKey && (
        <TouchableOpacity style={apiStyles.continueButton} onPress={handleGoBack}>
          <Text style={apiStyles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {settings.hasApiKey && (
        <TouchableOpacity style={apiStyles.returnButton} onPress={handleGoBack}>
          <Text style={apiStyles.returnButtonText}>Return</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
  runWithoutApiKeyContainer: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  } as const,
  runWithoutApiKeyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  runWithoutApiKeyLabel: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  } as const,
  runWithoutApiKeyDescription: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  } as const,
  manualPriceContainer: {
    marginTop: 8,
  } as const,
};
