import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { globalStyles, colors } from '@/styles/global';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Linking, Image } from 'react-native';
import { getUserSettings, updateApiKey, removeApiKey, updatePreference, type UserSettings } from '@/services/settingsService';
import { AVAILABLE_CURRENCIES, AVAILABLE_UNITS, METALS_DEV_URL } from '@/config';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    createdAt: '',
    updatedAt: '',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const s = await getUserSettings();
      setSettings(s);
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
    if (settings.hasApiKey) {
      router.replace('/account');
    } else {
      router.back();
    }
  }

  async function handleRemoveApiKey() {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your API key? This will allow you to test the setup flow again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeApiKey();
              setSettings({ currency: 'GBP', unit: 'toz', hasApiKey: false, createdAt: '', updatedAt: '' });
              Alert.alert('Success', 'API key removed. Restart the app to test the setup flow.');
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
            <TouchableOpacity style={apiStyles.removeButton} onPress={handleRemoveApiKey}>
              <Text style={apiStyles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={apiStyles.notConfiguredText}>API key not configured</Text>
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
          </View>
        )}
      </View>

      <View style={apiStyles.section}>
        <Text style={apiStyles.sectionTitle}>Preferences</Text>

        <Text style={apiStyles.label}>Currency</Text>
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                apiStyles.optionButton,
                settings.currency === curr.code && apiStyles.optionButtonActive,
              ]}
              onPress={() => handleCurrencyChange(curr.code)}
            >
              <Text
                style={[
                  apiStyles.optionButtonText,
                  settings.currency === curr.code && apiStyles.optionButtonTextActive,
                ]}
              >
                {curr.code} ({curr.symbol})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={apiStyles.label}>Unit</Text>
        <View style={apiStyles.optionsRow}>
          {AVAILABLE_UNITS.map((u) => (
            <TouchableOpacity
              key={u.code}
              style={[
                apiStyles.optionButton,
                settings.unit === u.code && apiStyles.optionButtonActive,
              ]}
              onPress={() => handleUnitChange(u.code)}
            >
              <Text
                style={[
                  apiStyles.optionButtonText,
                  settings.unit === u.code && apiStyles.optionButtonTextActive,
                ]}
              >
                {u.name} ({u.abbrev})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  optionButtonText: {
    fontSize: 14,
    color: '#888',
  } as const,
  optionButtonTextActive: {
    color: colors.gold,
    fontWeight: '600' as const,
  } as const,
};
