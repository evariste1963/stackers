import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getLatestPrice, saveSpotPrice, type GoldPriceData } from '@/services/priceService';
import { getHistory, saveToHistory, migrateStaticData, getHistoryLength, type HistoryEntry } from '@/services/historyService';
import { getApiKey, getUserSettings, migrateFromKVStore, type UserSettings } from '@/services/settingsService';
import { fetchGoldPrice } from '@/services/goldPriceApi';

interface PriceContextType {
  priceData: GoldPriceData | null;
  history: HistoryEntry[];
  settings: UserSettings;
  isLoading: boolean;
  isSettingsLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  apiKeyConfigured: boolean;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [priceData, setPriceData] = useState<GoldPriceData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    createdAt: '',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCachedPrice = useCallback(async () => {
    const cached = await getLatestPrice();
    if (cached) {
      setPriceData(cached);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    await migrateFromKVStore();
    
    const historyLength = await getHistoryLength();
    if (historyLength === 0) {
      await migrateStaticData();
    }
    const fullHistory = await getHistory();
    setHistory(fullHistory);
  }, []);

  const loadSettings = useCallback(async () => {
    let s = await getUserSettings();
    
    if (!s.hasApiKey) {
      const apiKey = await getApiKey();
      if (apiKey) {
        s.hasApiKey = true;
      }
    }
    
    setSettings(s);
    setIsSettingsLoading(false);
  }, []);

  const refreshPrice = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchGoldPrice(apiKey, settings.currency, settings.unit);
      
      const savedData = await saveSpotPrice(
        result.price,
        result.ask,
        result.bid,
        result.high,
        result.low,
        result.change,
        result.changePercent,
        settings.currency,
        settings.unit
      );
      
      await saveToHistory(result.price, result.change, result.changePercent);
      setPriceData(savedData);
      
      const fullHistory = await getHistory();
      setHistory(fullHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch price';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [settings.currency, settings.unit]);

  useEffect(() => {
    loadCachedPrice();
    loadHistory();
    loadSettings();
  }, [loadCachedPrice, loadHistory, loadSettings]);

  return (
    <PriceContext.Provider value={{
      priceData,
      history,
      settings,
      isLoading,
      isSettingsLoading,
      error,
      refreshPrice,
      apiKeyConfigured: settings.hasApiKey,
    }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
}