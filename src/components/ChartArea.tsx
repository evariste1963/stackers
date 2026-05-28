import { View, useWindowDimensions } from 'react-native';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { getHistory, type HistoryEntry, migrateStaticData, getHistoryLength } from '@/services/historyService';
import { colors } from '../styles/global';

const TWELVE_MONTHS_MS = 12 * 30 * 24 * 60 * 60 * 1000;
const PRICE_PADDING_RATIO = 0.1;
const CONTAINER_HEIGHT = 160;
const CHART_HEIGHT = CONTAINER_HEIGHT - 10;
const LEFT_PADDING = 34;
const RIGHT_PADDING = 10;
const YAXIS_LABEL_X = 28;
const YAXIS_PADDING_TOP = 10;
const YAXIS_PADDING_BOTTOM = 10;
const MONTH_STEP = 2;
const XAXIS_LABEL_Y = 150;

type ChartAreaProps = {
  history?: HistoryEntry[];
  unit?: string;
  metal?: 'gold' | 'silver';
};

export default function ChartArea({ history: propHistory, unit = 'toz', metal = 'gold' }: ChartAreaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const chartTotalWidth = screenWidth - 40;
  const svgWidth = chartTotalWidth;
  const availableWidth = svgWidth - LEFT_PADDING - RIGHT_PADDING;

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (propHistory && propHistory.length > 0) {
      setData(propHistory);
      setIsLoading(false);
    } else {
      async function loadData() {
        try {
          const historyLength = await getHistoryLength(metal);
          if (historyLength === 0) {
            await migrateStaticData(metal);
          }
          const history = await getHistory(metal);
          if (isMountedRef.current) {
            setData(history);
          }
        } catch (error) {
          console.error('Error loading chart data:', error);
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        }
      }
      loadData();
    }
  }, [propHistory, metal]);

  const getPriceForUnit = (entry: HistoryEntry, unit: string) => {
    const price = unit === 'toz'
      ? (entry.toz ?? entry.gms ?? entry.price)
      : (entry.gms ?? entry.price);
    return price ?? 0;
  };

  const chartData = useMemo(() => data.map((entry) => ({
    x: new Date(entry.date).getTime(),
    y: getPriceForUnit(entry, unit),
  })), [data, unit]);

  const timestamps = useMemo(() => chartData.map(d => d.x), [chartData]);
  const allMinDate = useMemo(() => Math.min(...timestamps), [timestamps]);
  const allMaxDate = useMemo(() => Math.max(...timestamps), [timestamps]);

  const twelveMonthsAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date.getTime();
  }, []);

  const totalDataSpan = useMemo(() => allMaxDate - allMinDate, [allMaxDate, allMinDate]);
  const hasTwelveMonths = totalDataSpan >= TWELVE_MONTHS_MS;

  const visibleData = useMemo(() => {
    if (!hasTwelveMonths) return chartData;
    return chartData.filter(d => d.x >= twelveMonthsAgo);
  }, [chartData, hasTwelveMonths, twelveMonthsAgo]);

  const displayData = visibleData;

  const displayMinDate = useMemo(() => Math.min(...displayData.map(d => d.x)), [displayData]);
  const displayMaxDate = useMemo(() => Math.max(...displayData.map(d => d.x)), [displayData]);

  const allPrices = useMemo(() => chartData.map(d => d.y), [chartData]);
  const maxPrice = useMemo(() => Math.max(...allPrices), [allPrices]);
  const minPrice = useMemo(() => Math.min(...allPrices), [allPrices]);
  const padding = (maxPrice - minPrice) * PRICE_PADDING_RATIO;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  const xScale = useCallback((timestamp: number) => {
    const range = displayMaxDate - displayMinDate;
    if (range === 0) return LEFT_PADDING;
    return LEFT_PADDING + ((timestamp - displayMinDate) / range) * availableWidth;
  }, [displayMaxDate, displayMinDate, availableWidth]);

  const yScale = useCallback((price: number) => {
    const range = yMax - yMin;
    if (range === 0) return CHART_HEIGHT / 2;
    const availableHeight = CHART_HEIGHT - YAXIS_PADDING_TOP - YAXIS_PADDING_BOTTOM;
    return YAXIS_PADDING_TOP + availableHeight - ((price - yMin) / range) * availableHeight;
  }, [yMax, yMin]);

  const linePath = useMemo(() => {
    if (displayData.length <= 1) return '';
    return displayData.reduce((path, point, i) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  }, [displayData, xScale, yScale]);

  const fillPath = useMemo(() => {
    if (displayData.length <= 1) return '';
    const bottomY = CHART_HEIGHT - YAXIS_PADDING_BOTTOM;
    let path = displayData.reduce((acc, point, i) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
    const firstX = xScale(displayData[0].x);
    const lastX = xScale(displayData[displayData.length - 1].x);
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    return path;
  }, [displayData, xScale, yScale]);

  const monthlyTicks = useMemo(() => {
    const ticks: { x: number; label: string }[] = [];
    const start = new Date(displayMinDate);
    start.setDate(1);
    const end = new Date(displayMaxDate);
    while (start.getTime() <= end.getTime()) {
      ticks.push({
        x: start.getTime(),
        label: `${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getFullYear()).slice(-2)}`,
      });
      start.setMonth(start.getMonth() + MONTH_STEP);
    }
    return ticks;
  }, [displayMinDate, displayMaxDate]);

  if (isLoading || data.length === 0) {
    return (
      <View style={{ width: chartTotalWidth, height: CONTAINER_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={svgWidth} height={CONTAINER_HEIGHT} />
      </View>
    );
  }

  const yTicks = [maxPrice, (maxPrice + minPrice) / 2, minPrice];

  return (
    <View style={{ width: chartTotalWidth }}>
      <Svg width={svgWidth} height={CONTAINER_HEIGHT}>
        {yTicks.map((tick, i) => (
          <SvgText
            key={i}
            x={YAXIS_LABEL_X}
            y={yScale(tick)}
            fontSize={10}
            fill={colors.chartAxis}
            textAnchor="end"
          >
            {Math.round(tick)}
          </SvgText>
        ))}
        {monthlyTicks.map((tick, i) => {
          const x = xScale(tick.x);
          if (x < LEFT_PADDING) return null;
          return (
            <SvgText
              key={i}
              x={x}
              y={XAXIS_LABEL_Y}
              fontSize={10}
              fill={colors.chartAxis}
              textAnchor="middle"
            >
              {tick.label}
            </SvgText>
          );
        })}
        <Path
          d={fillPath}
          fill={colors.themeBlue + '40'}
        />
        <Path
          d={linePath}
          stroke={colors.themeBlue}
          strokeWidth={3}
          fill="none"
        />
      </Svg>
    </View>
  );
}
