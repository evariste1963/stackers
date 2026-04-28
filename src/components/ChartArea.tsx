import { View, Text, useWindowDimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';
import { priceData } from '../../assets/priceData.js';
import { colors } from '../styles/global';

export default function ChartArea() {
  const { width: screenWidth } = useWindowDimensions();

  const data = Object.entries(priceData).map(([date, price], index) => ({
    x: index,
    y: price,
    date,
  }));

  const prices = data.map(d => d.y);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const roundedMax = Math.ceil(maxPrice / 100) * 100 + 50;
  const roundedMin = Math.floor(minPrice / 100) * 100 - 50;

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <VictoryChart
          width={screenWidth - 30}
          height={150}
          padding={{ top: 10, bottom: 20, left: 45, right: 15 }}
          domainPadding={{ x: 0 }}
          domain={{ y: [roundedMin, roundedMax] }}
        >
          <VictoryAxis
            dependentAxis
            orientation="left"
            tickValues={[roundedMax, (roundedMax + roundedMin) / 2, roundedMin]}
            tickFormat={(t) => Math.round(t).toString()}
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
          <VictoryAxis
            tickFormat={() => ''}
            style={{
              axis: { stroke: 'transparent' },
              grid: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
            }}
          />
          <VictoryLine
            data={data}
            x="x"
            y="y"
            style={{
              data: {
                stroke: colors.themeColorPrimary,
                strokeWidth: 5,
              },
            }}
            interpolation="linear"
          />
        </VictoryChart>
      </View>
    </View>
  );
}