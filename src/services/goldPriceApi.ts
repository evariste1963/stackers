const METALS_DEV_BASE_URL = 'https://api.metals.dev/v1/metal/spot';

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

export interface GoldPriceResult {
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
  if (typeof rate.price !== 'number') {
    throw new Error('Invalid response: missing price in rate');
  }
}

export async function fetchGoldPrice(
  apiKey: string, 
  currency: string = 'GBP', 
  unit: string = 'toz'
): Promise<GoldPriceResult> {
  const url = `${METALS_DEV_BASE_URL}?api_key=${apiKey}&metal=gold&currency=${currency}&unit=${unit}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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