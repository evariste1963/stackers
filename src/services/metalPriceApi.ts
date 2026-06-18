const GOLDAPI_BASE_URL = 'https://www.goldapi.io';

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

interface GoldApiResponse {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  prev_close_price: number;
  open_price: number;
  low_price: number;
  high_price: number;
  open_time: number;
  price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k?: number;
  price_gram_16k?: number;
  price_gram_14k?: number;
  price_gram_10k?: number;
}

function validateResponse(data: unknown): asserts data is GoldApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const r = data as Record<string, unknown>;

  if (typeof r.price !== 'number') {
    throw new Error('Invalid response: missing or invalid price');
  }
  if (typeof r.ch !== 'number') {
    throw new Error('Invalid response: missing or invalid ch');
  }
  if (typeof r.chp !== 'number') {
    throw new Error('Invalid response: missing or invalid chp');
  }
  if (typeof r.ask !== 'number') {
    throw new Error('Invalid response: missing or invalid ask');
  }
  if (typeof r.bid !== 'number') {
    throw new Error('Invalid response: missing or invalid bid');
  }
  if (typeof r.high_price !== 'number') {
    throw new Error('Invalid response: missing or invalid high_price');
  }
  if (typeof r.low_price !== 'number') {
    throw new Error('Invalid response: missing or invalid low_price');
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
  const url = `${GOLDAPI_BASE_URL}/api/${symbol}/${currency}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-access-token': apiKey,
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body === 'object' && body.error) {
        errorMsg = `API error: ${body.error}`;
      } else if (body && typeof body === 'object' && body.message) {
        errorMsg = `API error: ${body.message}`;
      } else {
        errorMsg = `API error: ${response.status} - ${JSON.stringify(body)}`;
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errorMsg = `API error: ${response.status} - ${text}`;
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  validateResponse(data);

  let price = data.price;
  let ask = data.ask;
  let bid = data.bid;
  let high = data.high_price;
  let low = data.low_price;

  if (unit === 'gram') {
    if (metal === 'gold' && data.price_gram_24k !== undefined) {
      price = data.price_gram_24k;
      ask = data.price_gram_24k;
      bid = data.price_gram_24k;
      high = data.price_gram_24k;
      low = data.price_gram_24k;
    } else {
      price = price / OUNCE_TO_GRAM;
      ask = ask / OUNCE_TO_GRAM;
      bid = bid / OUNCE_TO_GRAM;
      high = high / OUNCE_TO_GRAM;
      low = low / OUNCE_TO_GRAM;
    }
  }

  return {
    price,
    ask,
    bid,
    high,
    low,
    change: data.ch,
    changePercent: data.chp,
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
