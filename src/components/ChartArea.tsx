import { View, useWindowDimensions, ScrollView, Text } from 'react-native';
import { useRef, useState, useEffect } from 'react';
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
    if (!isLoading && scrollViewRef.current && hasTwelveMonths) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (propHistory && propHistory.length > 0 && scrollViewRef.current) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [propHistory]);

  useEffect(() => {
    if (isFocused && scrollViewRef.current && !isLoading) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [isFocused, isLoading]);

  if (isLoading || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 150 }}>
        <Svg width={screenWidth - 30} height={150} />
      </View>
    );
  }

  const getPriceForUnit = (entry: HistoryEntry, unit: string) => {
    if (unit === 'toz') return entry.toz || entry.gms || entry.price;
    return entry.gms || entry.price;
  };

  const chartData = data.map((entry) => ({
    x: new Date(entry.date).getTime(),
    y: getPriceForUnit(entry, unit),
  }));

  const timestamps = chartData.map(d => d.x);
  const allMinDate = Math.min(...timestamps);
  const allMaxDate = Math.max(...timestamps);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const twelveMonthsAgoTime = twelveMonthsAgo.getTime();

  const totalDataSpan = allMaxDate - allMinDate;
  const twelveMonthsMs = 12 * 30 * 24 * 60 * 60 * 1000;
  const hasTwelveMonths = totalDataSpan >= twelveMonthsMs;

  let visibleData = chartData;
  let displayData = chartData;
  
  if (hasTwelveMonths) {
    visibleData = chartData.filter(d => d.x >= twelveMonthsAgoTime);
    const visibleStart = Math.min(...visibleData.map(d => d.x));
    const visibleEnd = Math.max(...visibleData.map(d => d.x));
    const visibleSpan = visibleEnd - visibleStart;
    
    if (visibleSpan > 0 && visibleSpan < totalDataSpan) {
      const ratio = totalDataSpan / visibleSpan;
      displayData = visibleData.map(d => ({
        ...d,
        x: allMinDate + (d.x - visibleStart) * ratio,
      }));
    }
  }

  const allPrices = chartData.map(d => d.y);
  const maxPrice = Math.max(...allPrices);
  const minPrice = Math.min(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  const chartHeight = 130;
  const chartWidth = screenWidth - 65;

  const totalRange = allMaxDate - allMinDate;
  const visibleRange = hasTwelveMonths ? (allMaxDate - twelveMonthsAgoTime) : totalRange;
  
  let svgWidth: number;
  if (totalRange > visibleRange) {
    svgWidth = (screenWidth - 30) * (totalRange / visibleRange);
  } else {
    svgWidth = screenWidth - 30;
  }

  const generateMonthlyTicks = () => {
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
  };

  const xScale = (timestamp: number) => {
    const range = allMaxDate - allMinDate;
    if (range === 0) return 0;
    return ((timestamp - allMinDate) / range) * chartWidth;
  };

  const yScale = (price: number) => {
    const range = yMax - yMin;
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((price - yMin) / range) * chartHeight;
  };

  const linePath = displayData.length > 1
    ? displayData.reduce((path, point, i) => {
        const x = xScale(point.x);
        const y = yScale(point.y);
        return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
      }, '')
    : '';

  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 50, height: 150, justifyContent: 'space-between', paddingTop: 10, paddingBottom: 20 }}>
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
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Svg width={svgWidth} height={150}>
            <G y={10}>
              {generateMonthlyTicks().map((tick, i) => {
                const x = xScale(tick.x);
                return (
                  <G key={i}>
                    <SvgText
                      x={x}
                      y={150}
                      fontSize={10}
                      fill={colors.chartAxis}
                      textAnchor="middle"
                    >
                      {tick.label}
                    </SvgText>
                  </G>
                );
              })}
              <Path
                d={linePath}
                stroke={colors.themeBlue}
                strokeWidth={5}
                fill="none"
              />
            </G>
          </Svg>
        </ScrollView>
      </View>
    </View>
  );
}