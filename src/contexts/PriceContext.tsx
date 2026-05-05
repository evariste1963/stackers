import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getLatestPrice, saveSpotPrice, type GoldPriceData } from '@/services/priceService';
import { getHistory, saveToHistory, migrateStaticData, getHistoryLength, type HistoryEntry } from '@/services/historyService';
import { getApiKey, getUserSettings, migrateFromKVStore, updateManualPrice as saveManualPriceToSettings, updateManualHighLow as saveManualHighLow, type UserSettings } from '@/services/settingsService';
import { fetchGoldPrice } from '@/services/goldPriceApi';

interface PriceContextType {
  priceData: GoldPriceData | null;
  history: HistoryEntry[];
  settings: UserSettings;
  isLoading: boolean;
  isSettingsLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  refreshPriceFromDb: () => Promise<void>;
  apiKeyConfigured: boolean;
  refreshSettings: () => Promise<void>;
  runWithoutApiKey: boolean;
  updateManualPrice: (price: number) => Promise<void>;
  updateManualHighLow: (high: number, low: number) => Promise<void>;
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
      
      await saveManualHighLow(result.high, result.low);
      setSettings(prev => ({ ...prev, manualHighPrice: result.high, manualLowPrice: result.low }));
      
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

  const refreshPriceFromDb = useCallback(async () => {
    const cached = await getLatestPrice();
    if (cached) {
      setPriceData(cached);
    }
  }, []);

const updateManualPrice = useCallback(async (price: number) => {
    await saveManualPriceToSettings(price);
    
    const currentSettings = settingsRef.current;
    const previousPrice = currentSettings.previousManualPrice ?? currentSettings.manualPrice;
    const change = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? price - previousPrice : 0;
    const changePercent = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    
    let newHigh = currentSettings.manualHighPrice ?? price;
    let newLow = currentSettings.manualLowPrice ?? price;
    
    if (price > newHigh) {
      newHigh = price;
    }
    if (price < newLow || newLow === null || newLow === undefined) {
      newLow = price;
    }
    
    if (newHigh !== currentSettings.manualHighPrice || newLow !== currentSettings.manualLowPrice) {
      await saveManualHighLow(newHigh, newLow);
      setSettings(prev => ({ ...prev, manualHighPrice: newHigh, manualLowPrice: newLow }));
    }
    
    const savedData = await saveSpotPrice(
      price,
      price,
      price,
      newHigh,
      newLow,
      change,
      changePercent,
      currentSettings.currency,
      currentSettings.unit
    );
    setPriceData(savedData);
    setSettings(prev => ({ ...prev, manualPrice: price, previousManualPrice: previousPrice }));
  }, []);

  const updateManualHighLow = useCallback(async (high: number, low: number) => {
    await saveManualHighLow(high, low);
    setSettings(prev => ({ ...prev, manualHighPrice: high, manualLowPrice: low }));
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
            s.manualHighPrice ?? s.manualPrice,
            s.manualLowPrice ?? s.manualPrice,
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
      refreshPriceFromDb,
      apiKeyConfigured: settings.hasApiKey,
      refreshSettings,
      runWithoutApiKey,
      updateManualPrice,
      updateManualHighLow,
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