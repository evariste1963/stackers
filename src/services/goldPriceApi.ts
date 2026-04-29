const METALS_DEV_BASE_URL = 'https://api.metals.dev/v1/metal/spot';

export interface SpotMetalResponse {
  status: string;
  timestamp: string;
  currency: string;
  unit: string;
  metal: string;
  rate: {
    price: number;
    ask: number;
    bid: number;
    high: number;
    low: number;
    change: number;
    change_percent: number;
  };
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

  const data: SpotMetalResponse = await response.json();
  
  if (data.status !== 'success' || !data.rate?.price) {
    throw new Error('Invalid response: missing price data');
  }

  return {
    price: data.rate.price,
    ask: data.rate.ask,
    bid: data.rate.bid,
    high: data.rate.high,
    low: data.rate.low,
    change: data.rate.change,
    changePercent: data.rate.change_percent,
  };
}