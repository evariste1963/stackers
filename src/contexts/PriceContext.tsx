import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getLatestGoldPrice, getLatestSilverPrice, saveGoldSpotPrice, saveSilverSpotPrice, type MetalPriceData } from '@/services/metalPriceService';
import { getHistory, saveToHistory, migrateStaticData, getHistoryLength, seedYahooHistory, clearAndReseedHistory, updateTodayPriceEntry, type HistoryEntry } from '@/services/historyService';
import { getApiKey, getUserSettings, migrateFromKVStore, updateManualPrice as saveManualPriceToSettings, updateManualHighLow as saveManualHighLow, updateManualSilverPrice as saveManualSilverPrice, updateManualSilverHighLow as saveManualSilverHighLow, updateManualGoldPremium as saveManualGoldPremium, updateManualSilverPremium as saveManualSilverPremium, type UserSettings } from '@/services/settingsService';
import { fetchGoldPrice, fetchSilverPrice } from '@/services/metalPriceApi';

// GREEN: Type alias for metal-agnostic dedup
type Metal = 'gold' | 'silver';

interface PriceContextType {
  goldPriceData: MetalPriceData | null;
  silverPriceData: MetalPriceData | null;
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
  updateManualGoldPremium: (premium: number) => Promise<void>;
  updateManualSilverPremium: (premium: number) => Promise<void>;
  getAdjustedBidPrice: (metal: Metal) => number;
  refreshHistoryForCurrency: (currency: string) => Promise<void>;
  overwriteTodayPriceEntry: (metal: Metal, newPrice: number) => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

// GREEN: Service maps for metal-agnostic access (dedup)
const FETCH_FN = { gold: fetchGoldPrice, silver: fetchSilverPrice } as const;
const SAVE_SPOT_FN = { gold: saveGoldSpotPrice, silver: saveSilverSpotPrice } as const;

export function PriceProvider({ children }: { children: ReactNode }) {
  const [goldPriceData, setGoldPriceData] = useState<MetalPriceData | null>(null);
  const [silverPriceData, setSilverPriceData] = useState<MetalPriceData | null>(null);
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

  // GREEN: metalCfg helper — maps metal to service fns + state setters (dedup)
  function metalCfg(metal: Metal) {
    const gold = metal === 'gold';
    return {
      setPriceData: gold ? setGoldPriceData : setSilverPriceData,
      setHistory: gold ? setGoldHistory : setSilverHistory,
      saveManualPrice: (gold ? saveManualPriceToSettings : saveManualSilverPrice) as (price: number) => Promise<void>,
      saveHL: (gold ? saveManualHighLow : saveManualSilverHighLow) as (high: number, low: number) => Promise<void>,
      priceKey: gold ? 'manualPrice' as const : 'manualSilverPrice' as const,
      highKey: gold ? 'manualHighPrice' as const : 'manualSilverHighPrice' as const,
      lowKey: gold ? 'manualLowPrice' as const : 'manualSilverLowPrice' as const,
      prevKey: gold ? 'previousManualPrice' as const : 'previousManualSilverPrice' as const,
    };
  }

// GREEN: Shared refreshMetalPrice — replaces refreshGoldPrice + refreshSilverPrice
  const refreshMetalPrice = useCallback(async (metal: Metal) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentSettings = settingsRef.current;
      const result = await FETCH_FN[metal](apiKey, currentSettings.currency, currentSettings.unit);

      const savedData = await SAVE_SPOT_FN[metal](
        result.price, result.ask, result.bid, result.high, result.low,
        result.change, result.changePercent,
        currentSettings.currency, currentSettings.unit
      );

      await saveToHistory(result.price, result.change, result.changePercent, metal);
      const cfg = metalCfg(metal);
      cfg.setPriceData(savedData);

      await cfg.saveHL(result.high, result.low);
      setSettings(prev => ({ ...prev, [cfg.highKey]: result.high, [cfg.lowKey]: result.low }));

      const fullHistory = await getHistory(metal);
      cfg.setHistory(fullHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to fetch ${metal} price`;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GREEN: Thin wrappers calling shared refreshMetalPrice
  const refreshGoldPrice = useCallback(() => refreshMetalPrice('gold'), [refreshMetalPrice]);
  const refreshSilverPrice = useCallback(() => refreshMetalPrice('silver'), [refreshMetalPrice]);

/* RED ———— old refreshGoldPrice ————
  const refreshGoldPrice = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) { setError('API key not configured'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const currentSettings = settingsRef.current;
      const result = await fetchGoldPrice(apiKey, currentSettings.currency, currentSettings.unit);
      const savedData = await saveGoldSpotPrice(result.price, result.ask, result.bid, result.high, result.low, result.change, result.changePercent, currentSettings.currency, currentSettings.unit);
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
*/

/* RED ———— old refreshSilverPrice ————
  const refreshSilverPrice = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) { setError('API key not configured'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const currentSettings = settingsRef.current;
      const result = await fetchSilverPrice(apiKey, currentSettings.currency, currentSettings.unit);
      const savedData = await saveSilverSpotPrice(result.price, result.ask, result.bid, result.high, result.low, result.change, result.changePercent, currentSettings.currency, currentSettings.unit);
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
*/

  const refreshSettings = useCallback(async () => {
    const s = await getUserSettings();
    setSettings(s);
    setIsSettingsLoading(false);
  }, []);

  const refreshPricesFromDb = useCallback(async () => {
    const cachedGold = await getLatestGoldPrice();
    if (cachedGold) {
      setGoldPriceData(cachedGold);
    }
    const cachedSilver = await getLatestSilverPrice();
    if (cachedSilver) {
      setSilverPriceData(cachedSilver);
    }
  }, []);

// GREEN: Shared updateManualPriceCommon — replaces updateManualPrice + updateManualSilverPrice
  const updateManualPriceCommon = useCallback(async (metal: Metal, price: number) => {
    setError(null);

    try {
      const currentSettings = settingsRef.current;
      const cfg = metalCfg(metal);
      const saveSpotFn = SAVE_SPOT_FN[metal];

      await cfg.saveManualPrice(price);

      const previousPrice = currentSettings[cfg.prevKey] ?? currentSettings[cfg.priceKey];
      const prevNum = previousPrice ?? undefined;
      const change = prevNum !== undefined && prevNum > 0 ? price - prevNum : 0;
      const changePercent = prevNum !== undefined && prevNum > 0 ? (change / prevNum) * 100 : 0;

      let newHigh = currentSettings[cfg.highKey] ?? price;
      let newLow = currentSettings[cfg.lowKey] ?? price;

      if (price > newHigh) {
        newHigh = price;
      }
      if (price < newLow) {
        newLow = price;
      }

      if (newHigh !== currentSettings[cfg.highKey] || newLow !== currentSettings[cfg.lowKey]) {
        await cfg.saveHL(newHigh, newLow);
        setSettings(prev => ({ ...prev, [cfg.highKey]: newHigh, [cfg.lowKey]: newLow }));
      }

      const savedData = await saveSpotFn(
        price, price, price, newHigh, newLow,
        change, changePercent,
        currentSettings.currency, currentSettings.unit
      );
      await saveToHistory(price, change, changePercent, metal);
      const fullHistory = await getHistory(metal);
      cfg.setHistory(fullHistory);
      cfg.setPriceData(savedData);
      setSettings(prev => ({ ...prev, [cfg.priceKey]: price, [cfg.prevKey]: prevNum ?? null }));
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to update ${metal} price`;
      setError(message);
    }
  }, []);

  // GREEN: Thin wrappers calling shared updateManualPriceCommon
  const updateManualPrice = useCallback((price: number) => updateManualPriceCommon('gold', price), [updateManualPriceCommon]);
  const updateManualSilverPrice = useCallback((price: number) => updateManualPriceCommon('silver', price), [updateManualPriceCommon]);

/* RED ———— old updateManualPrice ————
  const updateManualPrice = useCallback(async (price: number) => {
    await saveManualPriceToSettings(price);
    const currentSettings = settingsRef.current;
    const previousPrice = currentSettings.previousManualPrice ?? currentSettings.manualPrice;
    const change = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? price - previousPrice : 0;
    const changePercent = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    let newHigh = currentSettings.manualHighPrice ?? price;
    let newLow = currentSettings.manualLowPrice ?? price;
    if (price > newHigh) { newHigh = price; }
    if (price < newLow || newLow === null || newLow === undefined) { newLow = price; }
    if (newHigh !== currentSettings.manualHighPrice || newLow !== currentSettings.manualLowPrice) {
      await saveManualHighLow(newHigh, newLow);
      setSettings(prev => ({ ...prev, manualHighPrice: newHigh, manualLowPrice: newLow }));
    }
    const savedData = await saveGoldSpotPrice(price, price, price, newHigh, newLow, change, changePercent, currentSettings.currency, currentSettings.unit);
    await saveToHistory(price, change, changePercent, 'gold');
    const fullHistory = await getHistory('gold');
    setGoldHistory(fullHistory);
    setGoldPriceData(savedData);
    setSettings(prev => ({ ...prev, manualPrice: price, previousManualPrice: previousPrice }));
  }, []);
*/

/* RED ———— old updateManualSilverPrice ————
  const updateManualSilverPrice = useCallback(async (price: number) => {
    await saveManualSilverPrice(price);
    const currentSettings = settingsRef.current;
    const previousPrice = currentSettings.previousManualSilverPrice ?? currentSettings.manualSilverPrice;
    const change = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? price - previousPrice : 0;
    const changePercent = previousPrice !== null && previousPrice !== undefined && previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    let newHigh = currentSettings.manualSilverHighPrice ?? price;
    let newLow = currentSettings.manualSilverLowPrice ?? price;
    if (price > newHigh) { newHigh = price; }
    if (price < newLow || newLow === null || newLow === undefined) { newLow = price; }
    if (newHigh !== currentSettings.manualSilverHighPrice || newLow !== currentSettings.manualSilverLowPrice) {
      await saveManualSilverHighLow(newHigh, newLow);
      setSettings(prev => ({ ...prev, manualSilverHighPrice: newHigh, manualSilverLowPrice: newLow }));
    }
    const savedData = await saveSilverSpotPrice(price, price, price, newHigh, newLow, change, changePercent, currentSettings.currency, currentSettings.unit);
    await saveToHistory(price, change, changePercent, 'silver');
    const fullHistory = await getHistory('silver');
    setSilverHistory(fullHistory);
    setSilverPriceData(savedData);
    setSettings(prev => ({ ...prev, manualSilverPrice: price, previousManualSilverPrice: previousPrice }));
  }, []);
*/

  const updateManualHighLow = useCallback(async (high: number, low: number) => {
    await saveManualHighLow(high, low);
    setSettings(prev => ({ ...prev, manualHighPrice: high, manualLowPrice: low }));
  }, []);

  const updateManualSilverHighLow = useCallback(async (high: number, low: number) => {
    await saveManualSilverHighLow(high, low);
    setSettings(prev => ({ ...prev, manualSilverHighPrice: high, manualSilverLowPrice: low }));
  }, []);

  const updateManualGoldPremium = useCallback(async (premium: number) => {
    await saveManualGoldPremium(premium);
    setSettings(prev => ({ ...prev, manualGoldPremium: premium }));
  }, []);

  const updateManualSilverPremium = useCallback(async (premium: number) => {
    await saveManualSilverPremium(premium);
    setSettings(prev => ({ ...prev, manualSilverPremium: premium }));
  }, []);

  const refreshHistoryForCurrency = useCallback(async (currency: string) => {
    const result = await clearAndReseedHistory(currency);
    if (result.gold.length > 0) setGoldHistory(result.gold);
    if (result.silver.length > 0) setSilverHistory(result.silver);
  }, []);

// GREEN: Collapsed overwriteTodayPriceEntry — if/else replaced by metalCfg + service maps
  const overwriteTodayPriceEntry = useCallback(async (metal: Metal, newPrice: number) => {
    setError(null);

    const currentSettings = settingsRef.current;
    const updated = await updateTodayPriceEntry(metal, newPrice, 0, 0);
    if (!updated) return;

    const cfg = metalCfg(metal);
    const saveSpotFn = SAVE_SPOT_FN[metal];

    const savedData = await saveSpotFn(
      newPrice, newPrice, newPrice, newPrice, newPrice,
      0, 0, currentSettings.currency, currentSettings.unit
    );
    await cfg.saveManualPrice(newPrice);
    await cfg.saveHL(newPrice, newPrice);
    cfg.setPriceData(savedData);
    setSettings(prev => ({ ...prev, [cfg.priceKey]: newPrice, [cfg.highKey]: newPrice, [cfg.lowKey]: newPrice }));
    const fullHistory = await getHistory(metal);
    cfg.setHistory(fullHistory);
  }, []);

/* RED ———— old overwriteTodayPriceEntry with if/else branches ————
  const overwriteTodayPriceEntry = useCallback(async (metal: 'gold' | 'silver', newPrice: number) => {
    const currentSettings = settingsRef.current;
    const updated = await updateTodayPriceEntry(metal, newPrice, 0, 0);
    if (!updated) return;
    if (metal === 'gold') {
      const savedData = await saveGoldSpotPrice(newPrice, newPrice, newPrice, newPrice, newPrice, 0, 0, currentSettings.currency, currentSettings.unit);
      await saveManualPriceToSettings(newPrice);
      await saveManualHighLow(newPrice, newPrice);
      setGoldPriceData(savedData);
      setSettings(prev => ({ ...prev, manualPrice: newPrice, manualHighPrice: newPrice, manualLowPrice: newPrice }));
      const fullHistory = await getHistory('gold');
      setGoldHistory(fullHistory);
    } else {
      const savedData = await saveSilverSpotPrice(newPrice, newPrice, newPrice, newPrice, newPrice, 0, 0, currentSettings.currency, currentSettings.unit);
      await saveManualSilverPrice(newPrice);
      await saveManualSilverHighLow(newPrice, newPrice);
      setSilverPriceData(savedData);
      setSettings(prev => ({ ...prev, manualSilverPrice: newPrice, manualSilverHighPrice: newPrice, manualSilverLowPrice: newPrice }));
      const fullHistory = await getHistory('silver');
      setSilverHistory(fullHistory);
    }
  }, []);
*/

  const getAdjustedBidPrice = useCallback((metal: 'gold' | 'silver'): number => {
    const priceData = metal === 'gold' ? goldPriceData : silverPriceData;
    const premium = metal === 'gold' ? settings.manualGoldPremium : settings.manualSilverPremium;
    const isOffGrid = !settings.hasApiKey;
    
    if (!priceData) return 0;
    
    const bidPrice = (priceData.bid && priceData.bid > 0) ? priceData.bid : priceData.price || 0;
    
    if (!isOffGrid) return bidPrice;
    
    if (premium === null || premium === undefined || premium < 0) return bidPrice;
    
    return bidPrice * (1 - premium / 100);
  }, [goldPriceData, silverPriceData, settings.manualGoldPremium, settings.manualSilverPremium, settings.hasApiKey]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const apiKey = await getApiKey();

      const cachedGold = await getLatestGoldPrice();
      if (mounted && cachedGold) {
        setGoldPriceData(cachedGold);
      }
      
      const cachedSilver = await getLatestSilverPrice();
      if (mounted && cachedSilver) {
        setSilverPriceData(cachedSilver);
      }
      
      await migrateFromKVStore();
      
      const s = await getUserSettings();
      
      const goldHistoryLength = await getHistoryLength('gold');
      if (mounted && goldHistoryLength === 0) {
        const yahooSeeded = await seedYahooHistory('gold', s.currency);
        if (!yahooSeeded) {
          await migrateStaticData('gold');
        }
      }
      const goldHistoryData = await getHistory('gold');
      if (mounted) {
        setGoldHistory(goldHistoryData);
      }
      
      const silverHistoryLength = await getHistoryLength('silver');
      if (mounted && silverHistoryLength === 0) {
        const yahooSeeded = await seedYahooHistory('silver', s.currency);
        if (!yahooSeeded) {
          await migrateStaticData('silver');
        }
      }
      const silverHistoryData = await getHistory('silver');
      if (mounted) {
        setSilverHistory(silverHistoryData);
      }
      
      if (mounted) {
        const existingGold = await getLatestGoldPrice();
        const existingSilver = await getLatestSilverPrice();

        if (s.manualPrice !== null && s.manualPrice !== undefined && !apiKey) {
          const savedData = await saveGoldSpotPrice(
            s.manualPrice,
            s.manualPrice,
            s.manualPrice,
            s.manualHighPrice ?? s.manualPrice,
            s.manualLowPrice ?? s.manualPrice,
            existingGold?.change ?? 0,
            existingGold?.changePercent ?? 0,
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
            existingSilver?.change ?? 0,
            existingSilver?.changePercent ?? 0,
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
      updateManualGoldPremium,
      updateManualSilverPremium,
      getAdjustedBidPrice,
      refreshHistoryForCurrency,
      overwriteTodayPriceEntry,
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