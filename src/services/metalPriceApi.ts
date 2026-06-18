const METALPRICE_API_BASE_URL = 'https://api.metalpriceapi.com/v1';

const METAL_TO_SYMBOL: Record<string, string> = {
  gold: 'XAU',
  silver: 'XAG',
};

const OUNCE_TO_GRAM = 31.1035;

export type MetalType = 'gold' | 'silver';

const VALID_METALS: MetalType[] = ['gold', 'silver'];

function isValidMetal(metal: string): metal is MetalType {
  return VALID_METALS.includes(metal as MetalType);
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

interface MetalPriceApiResponse {
  success: boolean;
  base: string;
  timestamp: number;
  rates: Record<string, number>;
  error?: {
    code: number;
    info: string;
  };
}

function validateResponse(data: unknown, currency: string): asserts data is MetalPriceApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const response = data as Record<string, unknown>;

  if (response.success !== true) {
    const errorInfo = response.error
      ? (typeof response.error === 'object' ? (response.error as Record<string, unknown>).info : 'Unknown error')
      : 'Unknown error';
    throw new Error(`API error: ${errorInfo}`);
  }

  if (!response.rates || typeof response.rates !== 'object') {
    throw new Error('Invalid response: missing rates');
  }

  const rates = response.rates as Record<string, unknown>;
  if (typeof rates[currency] !== 'number') {
    throw new Error(`Invalid response: missing rate for currency ${currency}`);
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

  const symbol = METAL_TO_SYMBOL[metal];
  const url = `${METALPRICE_API_BASE_URL}/latest?api_key=${encodeURIComponent(apiKey)}&base=${symbol}&currencies=USD,GBP,EUR`;

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

  validateResponse(data, currency);

  let price = data.rates[currency];

  if (unit === 'gram') {
    price = price / OUNCE_TO_GRAM;
  }

  return {
    price,
    ask: price,
    bid: price,
    high: price,
    low: price,
    change: 0,
    changePercent: 0,
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
