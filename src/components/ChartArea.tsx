import { View, useWindowDimensions, ScrollView, Text } from 'react-native';
import { useRef, useState } from 'react';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';
import { useEffect } from 'react';
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
        <VictoryChart
          width={screenWidth - 30}
          height={150}
        />
      </View>
    );
  }

  const getPriceForUnit = (entry: HistoryEntry, unit: string) => {
    if (unit === 'toz') return entry.toz || entry.gms || entry.price;
    return entry.gms || entry.price; // gram
  };

  const chartData = data.map((entry) => ({
    x: new Date(entry.date).getTime(),
    y: getPriceForUnit(entry, unit),
    date: entry.date,
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

  const minDate = allMinDate;
  const maxDate = allMaxDate;

  const generateMonthlyTicks = () => {
    const ticks: number[] = [];
    const start = new Date(minDate);
    start.setDate(1);
    
    while (start.getTime() <= maxDate) {
      ticks.push(start.getTime());
      start.setMonth(start.getMonth() + 2);
    }
    
    return ticks;
  };

  const tickValues = generateMonthlyTicks();

  const allPrices = chartData.map(d => d.y);
  const maxPrice = Math.max(...allPrices);
  const minPrice = Math.min(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  const totalRange = allMaxDate - allMinDate;
  const visibleRange = hasTwelveMonths ? (allMaxDate - twelveMonthsAgoTime) : totalRange;
  
  let chartWidth: number;
  if (totalRange > visibleRange) {
    chartWidth = (screenWidth - 30) * (totalRange / visibleRange);
  } else {
    chartWidth = screenWidth - 30;
  }

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
        <VictoryChart
          width={chartWidth}
          height={150}
          padding={{ top: 10, bottom: 20, left: 0, right: 15 }}
          domainPadding={{ x: 0 }}
          domain={{ x: [minDate, maxDate], y: [yMin, yMax] }}
        >
          <VictoryAxis
            tickValues={tickValues}
            tickFormat={(t) => {
              const d = new Date(t);
              return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).slice(-2)}`;
            }}
            style={{
              axis: { stroke: 'transparent' },
              grid: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: {
                fill: colors.chartAxis,
                fontSize: 10,
              },
            }}
          />
          <VictoryLine
            data={displayData}
            x="x"
            y="y"
            style={{
              data: {
                stroke: colors.themeBlue,
                strokeWidth: 5,
              },
            }}
            interpolation="linear"
          />
        </VictoryChart>
      </ScrollView>
    </View>
    </View>
  );
}