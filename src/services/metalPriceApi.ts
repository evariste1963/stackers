const METALS_DEV_BASE_URL = 'https://api.metals.dev/v1/metal/spot';

export type MetalType = 'gold' | 'silver';

const VALID_METALS: MetalType[] = ['gold', 'silver'];

function isValidMetal(metal: string): metal is MetalType {
  return VALID_METALS.includes(metal as MetalType);
}

export interface SpotMetalResponse {
  status: string;
  timestamp: string;
  currency: string;
  unit: string;
  metal: string;
  rate?: {
    price: number;
    ask: number;
    bid: number;
    high: number;
    low: number;
    change: number;
    change_percent: number;
  };
  message?: string;
}

export interface MetalPriceResult {
  price: number;
  ask: number;
  bid: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
}

function validateResponse(data: unknown): asserts data is SpotMetalResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const response = data as Record<string, unknown>;

  if (typeof response.status !== 'string') {
    throw new Error('Invalid response: missing status field');
  }

  if (response.status !== 'success') {
    const message = typeof response.message === 'string' ? response.message : 'Unknown error';
    throw new Error(`API returned status: ${response.status} - ${message}`);
  }

  if (!response.rate || typeof response.rate !== 'object') {
    throw new Error('Invalid response: missing or invalid rate field');
  }

  const rate = response.rate as Record<string, unknown>;
  const requiredRateFields = ['price', 'ask', 'bid', 'high', 'low', 'change', 'change_percent'] as const;
  for (const field of requiredRateFields) {
    if (typeof rate[field] !== 'number') {
      throw new Error(`Invalid response: missing ${field} in rate`);
    }
  }
}

export async function fetchMetalPrice(
  metal: MetalType,
  apiKey: string, 
  currency: string = 'GBP', 
  unit: string = 'toz',
  timeoutMs: number = 10000
): Promise<MetalPriceResult> {
  if (!isValidMetal(metal)) {
    throw new Error(`Invalid metal: ${metal}. Must be one of: ${VALID_METALS.join(', ')}`);
  }

  const url = `${METALS_DEV_BASE_URL}?api_key=${encodeURIComponent(apiKey)}&metal=${encodeURIComponent(metal)}&currency=${encodeURIComponent(currency)}&unit=${encodeURIComponent(unit)}`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  validateResponse(data);

  return {
    price: data.rate!.price,
    ask: data.rate!.ask,
    bid: data.rate!.bid,
    high: data.rate!.high,
    low: data.rate!.low,
    change: data.rate!.change,
    changePercent: data.rate!.change_percent,
  };
}

export async function fetchGoldPrice(
  apiKey: string, 
  currency: string = 'GBP', 
  unit: string = 'toz',
  timeoutMs: number = 10000
): Promise<MetalPriceResult> {
  return fetchMetalPrice('gold', apiKey, currency, unit, timeoutMs);
}

export async function fetchSilverPrice(
  apiKey: string, 
  currency: string = 'GBP', 
  unit: string = 'toz',
  timeoutMs: number = 10000
): Promise<MetalPriceResult> {
  return fetchMetalPrice('silver', apiKey, currency, unit, timeoutMs);
}