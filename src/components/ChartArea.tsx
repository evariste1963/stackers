import { View, useWindowDimensions, ScrollView, Text } from 'react-native';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Svg, { Path, Line, Text as SvgText, G } from 'react-native-svg';
import { useIsFocused } from 'expo-router';
import { getHistory, type HistoryEntry, migrateStaticData, getHistoryLength } from '@/services/historyService';
import { colors } from '../styles/global';

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
          setData(history);
        } catch (error) {
          console.error('Error loading chart data:', error);
        } finally {
          setIsLoading(false);
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
    const twelveMonthsMs = 12 * 30 * 24 * 60 * 60 * 1000;
    const hasTwelveMonths = (maxDate - minDate) >= twelveMonthsMs;

    const shouldScroll = 
      (propHistory && propHistory.length > 0) ||
      isFocused ||
      hasTwelveMonths;

    if (shouldScroll) {
      const animated = propHistory && propHistory.length > 0;
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated });
      }, 100);
    }
  }, [propHistory, isFocused, isLoading, data]);

  const getPriceForUnit = (entry: HistoryEntry, unit: string) => {
    if (unit === 'toz') return entry.toz || entry.gms || entry.price;
    return entry.gms || entry.price;
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

  const twelveMonthsMs = 12 * 30 * 24 * 60 * 60 * 1000;
  const totalDataSpan = useMemo(() => allMaxDate - allMinDate, [allMaxDate, allMinDate]);
  const hasTwelveMonths = totalDataSpan >= twelveMonthsMs;

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
  const padding = (maxPrice - minPrice) * 0.1;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  const chartHeight = 130;
  const yAxisWidth = 40;
  const leftPadding = 0;
  const rightPadding = 20;

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
    return chartHeight - ((price - yMin) / range) * chartHeight;
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
      start.setMonth(start.getMonth() + 2);
    }
    return ticks;
  }, [allMinDate, allMaxDate]);

  if (isLoading || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 150 }}>
        <Svg width={screenWidth - 30} height={150} />
      </View>
    );
  }

  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: yAxisWidth, height: 150, justifyContent: 'space-between', paddingTop: 10, paddingBottom: 20 }}>
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
          <Svg width={svgWidth} height={150}>
            {monthlyTicks.map((tick, i) => {
              const x = xScale(tick.x);
              return (
                <SvgText
                  key={i}
                  x={x}
                  y={140}
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