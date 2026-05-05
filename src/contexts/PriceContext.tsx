import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getLatestPrice, saveSpotPrice, type GoldPriceData } from '@/services/priceService';
import { getHistory, saveToHistory, migrateStaticData, getHistoryLength, type HistoryEntry } from '@/services/historyService';
import { getApiKey, getUserSettings, migrateFromKVStore, updateManualPrice as saveManualPriceToSettings, type UserSettings } from '@/services/settingsService';
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
  refreshSettings: () => Promise<void>;
  runWithoutApiKey: boolean;
  updateManualPrice: (price: number) => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [priceData, setPriceData] = useState<GoldPriceData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    manualPrice: null,
    createdAt: '',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runWithoutApiKey = !settings.hasApiKey && settings.manualPrice !== null && settings.manualPrice !== undefined && settings.manualPrice > 0;
  
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const refreshPrice = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentSettings = settingsRef.current;
      const result = await fetchGoldPrice(apiKey, currentSettings.currency, currentSettings.unit);
      
      const savedData = await saveSpotPrice(
        result.price,
        result.ask,
        result.bid,
        result.high,
        result.low,
        result.change,
        result.changePercent,
        currentSettings.currency,
        currentSettings.unit
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
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await getUserSettings();
    setSettings(s);
    setIsSettingsLoading(false);
  }, []);

  const updateManualPrice = useCallback(async (price: number) => {
    await saveManualPriceToSettings(price);
    
    const now = new Date().toISOString();
    const savedData = await saveSpotPrice(
      price,
      price,
      price,
      price,
      price,
      0,
      0,
      settingsRef.current.currency,
      settingsRef.current.unit
    );
    setPriceData(savedData);
    setSettings(prev => ({ ...prev, manualPrice: price }));
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const apiKey = await getApiKey();

      const cached = await getLatestPrice();
      if (mounted && cached) {
        setPriceData(cached);
      }
      
      await migrateFromKVStore();
      
      const historyLength = await getHistoryLength();
      if (mounted && historyLength === 0) {
        await migrateStaticData();
      }
      const fullHistory = await getHistory();
      if (mounted) {
        setHistory(fullHistory);
      }
      
      const s = await getUserSettings();
      if (mounted) {
        const apiKey = await getApiKey();
        if (!s.hasApiKey && apiKey) {
          s.hasApiKey = true;
        }
        
        if (s.manualPrice !== null && s.manualPrice !== undefined && !apiKey) {
          const savedData = await saveSpotPrice(
            s.manualPrice,
            s.manualPrice,
            s.manualPrice,
            s.manualPrice,
            s.manualPrice,
            0,
            0,
            s.currency,
            s.unit
          );
          setPriceData(savedData);
        }
        
        setSettings(s);
        setIsSettingsLoading(false);
      }
    }
    
    init();
    
    return () => { mounted = false; };
  }, []);

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
      refreshSettings,
      runWithoutApiKey,
      updateManualPrice,
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