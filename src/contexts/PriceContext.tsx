import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getLatestPrice, saveSpotPrice, type GoldPriceData } from '@/services/priceService';
import { getLatestSilverPrice, saveSilverSpotPrice, type SilverPriceData } from '@/services/silverPriceService';
import { getHistory, saveToHistory, migrateStaticData, getHistoryLength, type HistoryEntry } from '@/services/historyService';
import { getApiKey, getUserSettings, migrateFromKVStore, updateManualPrice as saveManualPriceToSettings, updateManualHighLow as saveManualHighLow, updateManualSilverPrice as saveManualSilverPrice, updateManualSilverHighLow as saveManualSilverHighLow, type UserSettings } from '@/services/settingsService';
import { fetchGoldPrice, fetchSilverPrice, type MetalType } from '@/services/metalPriceApi';

interface PriceContextType {
  goldPriceData: GoldPriceData | null;
  silverPriceData: SilverPriceData | null;
  goldHistory: HistoryEntry[];
  silverHistory: HistoryEntry[];
  settings: UserSettings;
  isLoading: boolean;
  isSettingsLoading: boolean;
  error: string | null;
  refreshGoldPrice: () => Promise<void>;
  refreshSilverPrice: () => Promise<void>;
  refreshPricesFromDb: () => Promise<void>;
  apiKeyConfigured: boolean;
  refreshSettings: () => Promise<void>;
  offGridMode: boolean;
  silverOffGridMode: boolean;
  updateManualPrice: (price: number) => Promise<void>;
  updateManualSilverPrice: (price: number) => Promise<void>;
  updateManualHighLow: (high: number, low: number) => Promise<void>;
  updateManualSilverHighLow: (high: number, low: number) => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [goldPriceData, setGoldPriceData] = useState<GoldPriceData | null>(null);
  const [silverPriceData, setSilverPriceData] = useState<SilverPriceData | null>(null);
  const [goldHistory, setGoldHistory] = useState<HistoryEntry[]>([]);
  const [silverHistory, setSilverHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    unit: 'toz',
    hasApiKey: false,
    defaultMetal: 'gold',
    manualPrice: null,
    createdAt: '',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offGridMode = !settings.hasApiKey && settings.manualPrice !== null && settings.manualPrice !== undefined && settings.manualPrice > 0;
  const silverOffGridMode = !settings.hasApiKey && settings.manualSilverPrice !== null && settings.manualSilverPrice !== undefined && settings.manualSilverPrice > 0;
  
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const refreshGoldPrice = useCallback(async () => {
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
      
      await saveToHistory(result.price, result.change, result.changePercent, 'gold');
      setGoldPriceData(savedData);
      
      await saveManualHighLow(result.high, result.low);
      setSettings(prev => ({ ...prev, manualHighPrice: result.high, manualLowPrice: result.low }));
      
      const fullHistory = await getHistory('gold');
      setGoldHistory(fullHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch gold price';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSilverPrice = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentSettings = settingsRef.current;
      const result = await fetchSilverPrice(apiKey, currentSettings.currency, currentSettings.unit);
      
      const savedData = await saveSilverSpotPrice(
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
      
      await saveToHistory(result.price, result.change, result.changePercent, 'silver');
      setSilverPriceData(savedData);
      
      await saveManualSilverHighLow(result.high, result.low);
      setSettings(prev => ({ ...prev, manualSilverHighPrice: result.high, manualSilverLowPrice: result.low }));
      
      const fullHistory = await getHistory('silver');
      setSilverHistory(fullHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch silver price';
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

  const refreshPricesFromDb = useCallback(async () => {
    const cachedGold = await getLatestPrice();
    if (cachedGold) {
      setGoldPriceData(cachedGold);
    }
    const cachedSilver = await getLatestSilverPrice();
    if (cachedSilver) {
      setSilverPriceData(cachedSilver);
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
    await saveToHistory(price, change, changePercent, 'gold');
    const fullHistory = await getHistory('gold');
    setGoldHistory(fullHistory);
    setGoldPriceData(savedData);
    setSettings(prev => ({ ...prev, manualPrice: price, previousManualPrice: previousPrice }));
  }, []);

  const updateManualSilverPrice = useCallback(async (price: number) => {
    await saveManualSilverPrice(price);
    
    const currentSettings = settingsRef.current;
    const previousPrice = currentSettings.manualSilverPrice;
    const change = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? price - previousPrice : 0;
    const changePercent = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    
    let newHigh = currentSettings.manualSilverHighPrice ?? price;
    let newLow = currentSettings.manualSilverLowPrice ?? price;
    
    if (price > newHigh) {
      newHigh = price;
    }
    if (price < newLow || newLow === null || newLow === undefined) {
      newLow = price;
    }
    
    if (newHigh !== currentSettings.manualSilverHighPrice || newLow !== currentSettings.manualSilverLowPrice) {
      await saveManualSilverHighLow(newHigh, newLow);
      setSettings(prev => ({ ...prev, manualSilverHighPrice: newHigh, manualSilverLowPrice: newLow }));
    }
    
    const savedData = await saveSilverSpotPrice(
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
    await saveToHistory(price, change, changePercent, 'silver');
    const fullHistory = await getHistory('silver');
    setSilverHistory(fullHistory);
    setSilverPriceData(savedData);
    setSettings(prev => ({ ...prev, manualSilverPrice: price }));
  }, []);

  const updateManualHighLow = useCallback(async (high: number, low: number) => {
    await saveManualHighLow(high, low);
    setSettings(prev => ({ ...prev, manualHighPrice: high, manualLowPrice: low }));
  }, []);

  const updateManualSilverHighLow = useCallback(async (high: number, low: number) => {
    await saveManualSilverHighLow(high, low);
    setSettings(prev => ({ ...prev, manualSilverHighPrice: high, manualSilverLowPrice: low }));
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const apiKey = await getApiKey();

      const cachedGold = await getLatestPrice();
      if (mounted && cachedGold) {
        setGoldPriceData(cachedGold);
      }
      
      const cachedSilver = await getLatestSilverPrice();
      if (mounted && cachedSilver) {
        setSilverPriceData(cachedSilver);
      }
      
      await migrateFromKVStore();
      
      const goldHistoryLength = await getHistoryLength('gold');
      if (mounted && goldHistoryLength === 0) {
        await migrateStaticData('gold');
      }
      const goldHistoryData = await getHistory('gold');
      if (mounted) {
        setGoldHistory(goldHistoryData);
      }
      
      const silverHistoryLength = await getHistoryLength('silver');
      if (mounted && silverHistoryLength === 0) {
        await migrateStaticData('silver');
      }
      const silverHistoryData = await getHistory('silver');
      if (mounted) {
        setSilverHistory(silverHistoryData);
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
          setGoldPriceData(savedData);
        }
        
        if (s.manualSilverPrice !== null && s.manualSilverPrice !== undefined && !apiKey) {
          const savedData = await saveSilverSpotPrice(
            s.manualSilverPrice,
            s.manualSilverPrice,
            s.manualSilverPrice,
            s.manualSilverHighPrice ?? s.manualSilverPrice,
            s.manualSilverLowPrice ?? s.manualSilverPrice,
            0,
            0,
            s.currency,
            s.unit
          );
          setSilverPriceData(savedData);
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
      goldPriceData,
      silverPriceData,
      goldHistory,
      silverHistory,
      settings,
      isLoading,
      isSettingsLoading,
      error,
      refreshGoldPrice,
      refreshSilverPrice,
      refreshPricesFromDb,
      apiKeyConfigured: settings.hasApiKey,
      refreshSettings,
      offGridMode,
      silverOffGridMode,
      updateManualPrice,
      updateManualSilverPrice,
      updateManualHighLow,
      updateManualSilverHighLow,
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