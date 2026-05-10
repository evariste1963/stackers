import { View, useWindowDimensions, ScrollView, Text } from 'react-native';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useIsFocused } from 'expo-router';
import { getHistory, type HistoryEntry, migrateStaticData, getHistoryLength } from '@/services/historyService';
import { colors } from '../styles/global';

const TWELVE_MONTHS_MS = 12 * 30 * 24 * 60 * 60 * 1000;
const SCROLL_TIMEOUT = 100;
const PRICE_PADDING_RATIO = 0.1;
const CONTAINER_HEIGHT = 150;
const CHART_HEIGHT = CONTAINER_HEIGHT;
const YAXIS_WIDTH = 40;
const LEFT_PADDING = 0;
const RIGHT_PADDING = 20;
const SCREEN_WIDTH_MARGIN = 30;
const YAXIS_PADDING_TOP = 10;
const YAXIS_PADDING_BOTTOM = 10;
const MONTH_STEP = 2;
const XAXIS_LABEL_Y = 140;

type ChartAreaProps = {
  history?: HistoryEntry[];
  unit?: string;
  metal?: 'gold' | 'silver';
};

export default function ChartArea({ history: propHistory, unit = 'toz', metal = 'gold' }: ChartAreaProps) {
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    if (!scrollViewRef.current || isLoading) return;

    if (data.length < 2) return;

    const timestamps = data.map(e => new Date(e.date).getTime());
    const minDate = Math.min(...timestamps);
    const maxDate = Math.max(...timestamps);
    const twelveMonthsMs = TWELVE_MONTHS_MS;
    const hasTwelveMonths = (maxDate - minDate) >= twelveMonthsMs;

    const shouldScroll = 
      (propHistory && propHistory.length > 0) ||
      isFocused ||
      hasTwelveMonths;

    if (shouldScroll) {
      const animated = propHistory && propHistory.length > 0;
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated });
      }, SCROLL_TIMEOUT);
    }
  }, [propHistory, isFocused, isLoading, data]);

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

  const displayData = useMemo(() => {
    if (!hasTwelveMonths) return chartData;
    const visibleStart = Math.min(...visibleData.map(d => d.x));
    const visibleEnd = Math.max(...visibleData.map(d => d.x));
    const visibleSpan = visibleEnd - visibleStart;
    if (visibleSpan > 0 && visibleSpan < totalDataSpan) {
      const ratio = totalDataSpan / visibleSpan;
      return visibleData.map(d => ({
        ...d,
        x: allMinDate + (d.x - visibleStart) * ratio,
      }));
    }
    return chartData;
  }, [chartData, hasTwelveMonths, visibleData, totalDataSpan, allMinDate]);

  const allPrices = useMemo(() => chartData.map(d => d.y), [chartData]);
  const maxPrice = useMemo(() => Math.max(...allPrices), [allPrices]);
  const minPrice = useMemo(() => Math.min(...allPrices), [allPrices]);
  const padding = (maxPrice - minPrice) * PRICE_PADDING_RATIO;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  const chartHeight = CHART_HEIGHT;
  const yAxisWidth = YAXIS_WIDTH;
  const leftPadding = LEFT_PADDING;
  const rightPadding = RIGHT_PADDING;

  const availableWidth = screenWidth - yAxisWidth - leftPadding - rightPadding;
  const totalRange = allMaxDate - allMinDate;
  const visibleRange = hasTwelveMonths ? (allMaxDate - twelveMonthsAgo) : totalRange;
  const svgWidth = totalRange > visibleRange
    ? availableWidth * (totalRange / visibleRange)
    : availableWidth;

  const xScale = useCallback((timestamp: number) => {
    const range = allMaxDate - allMinDate;
    if (range === 0) return leftPadding;
    return leftPadding + ((timestamp - allMinDate) / range) * (svgWidth - leftPadding - rightPadding);
  }, [allMaxDate, allMinDate, svgWidth]);

  const yScale = useCallback((price: number) => {
    const range = yMax - yMin;
    if (range === 0) return chartHeight / 2;
    const availableHeight = chartHeight - YAXIS_PADDING_TOP - YAXIS_PADDING_BOTTOM;
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

  const monthlyTicks = useMemo(() => {
    const ticks: { x: number; label: string }[] = [];
    const start = new Date(allMinDate);
    start.setDate(1);
    const end = new Date(allMaxDate);
    while (start.getTime() <= end.getTime()) {
      ticks.push({
        x: start.getTime(),
        label: `${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getFullYear()).slice(-2)}`,
      });
      start.setMonth(start.getMonth() + MONTH_STEP);
    }
    return ticks;
  }, [allMinDate, allMaxDate]);

  if (isLoading || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: CONTAINER_HEIGHT }}>
        <Svg width={screenWidth - SCREEN_WIDTH_MARGIN} height={CONTAINER_HEIGHT} />
      </View>
    );
  }

  const yTicks = [maxPrice, (maxPrice + minPrice) / 2, minPrice];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: yAxisWidth, height: CONTAINER_HEIGHT, justifyContent: 'space-between', paddingTop: YAXIS_PADDING_TOP, paddingBottom: YAXIS_PADDING_BOTTOM }}>
          {yTicks.map((tick, i) => (
            <Text key={i} style={{ fontSize: 10, color: colors.chartAxis, textAlign: 'right' }}>
              {Math.round(tick)}
            </Text>
          ))}
        </View>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: svgWidth }}
        >
          <Svg width={svgWidth} height={CONTAINER_HEIGHT}>
            {monthlyTicks.map((tick, i) => {
              const x = xScale(tick.x);
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
              d={linePath}
              stroke={colors.themeBlue}
              strokeWidth={5}
              fill="none"
            />
          </Svg>
        </ScrollView>
      </View>
    </View>
  );
}