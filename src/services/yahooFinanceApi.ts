export interface YahooChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        adjclose: Array<{ adjclose: (number | null)[] }>;
        quote: Array<{
          close: (number | null)[];
        }>;
      };
    }> | null;
    error: { code: string; description: string } | null;
  };
}

export interface YahooPriceEntry {
  date: string;
  close: number;
}

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const FX_API = 'https://api.frankfurter.dev/latest?from=USD&to=GBP';

const SYMBOL_MAP: Record<string, string> = {
  gold: 'GC=F',
  silver: 'SI=F',
};

function getUnixMonthsAgo(months: number): number {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function getUnixNow(): number {
  return Math.floor(Date.now() / 1000);
}

function parseYahooResponse(data: YahooChartResponse): YahooPriceEntry[] {
  if (data.chart?.error) {
    throw new Error(`Yahoo API error: ${data.chart.error.code} - ${data.chart.error.description}`);
  }

  const result = data.chart?.result?.[0];
  if (!result) {
    throw new Error('Yahoo API: empty result');
  }

  const timestamps = result.timestamp;
  const adjCloses = result.indicators?.adjclose?.[0]?.adjclose;
  const closes = result.indicators?.quote?.[0]?.close;

  if (!timestamps?.length) {
    throw new Error('Yahoo API: no timestamps in response');
  }

  const prices = adjCloses || closes;
  if (!prices?.length) {
    throw new Error('Yahoo API: no price data in response');
  }

  const entries: YahooPriceEntry[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = prices[i];
    if (close === null || close === undefined || close <= 0) continue;

    const date = new Date(timestamps[i] * 1000);
    const dateStr = date.toISOString().split('T')[0];

    entries.push({ date: dateStr, close });
  }

  if (entries.length === 0) {
    throw new Error('Yahoo API: no valid price entries after filtering');
  }

  return entries;
}

export async function fetchGbpUsdRate(timeoutMs = 5000): Promise<number> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(FX_API, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeout);

    if (!response.ok) return 0.75;

    const data = await response.json();
    const rate = data?.rates?.GBP;
    return typeof rate === 'number' && rate > 0 ? rate : 0.75;
  } catch {
    return 0.75;
  }
}

export async function fetchYahooHistory(
  metal: 'gold' | 'silver',
  monthsBack = 12,
  timeoutMs = 10000
): Promise<YahooPriceEntry[]> {
  const symbol = SYMBOL_MAP[metal];
  if (!symbol) {
    throw new Error(`Unknown metal: ${metal}`);
  }

  const period1 = getUnixMonthsAgo(monthsBack);
  const period2 = getUnixNow();

  const url = `${YAHOO_BASE}/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo API HTTP ${response.status}: ${response.statusText}`);
    }

    const data: YahooChartResponse = await response.json();
    return parseYahooResponse(data);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Yahoo API request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
