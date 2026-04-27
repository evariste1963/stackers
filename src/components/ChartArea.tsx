import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { priceData } from '../../assets/priceData.js';

export default function ChartArea() {
  const { width: screenWidth } = useWindowDimensions();

  const data = Object.entries(priceData).map(([date, price]) => ({
    value: price
  }));

  const maxDataValue = Math.max(...data.map(d => d.value));
  const roundedMax = Math.ceil(maxDataValue / 10) * 10 + 10;

  const yAxisValues = [0, roundedMax / 4, roundedMax / 2, (3 * roundedMax) / 4, roundedMax];

  const dataLength = data.length;
  const yAxisWidth = 25;
  const leftPadding = 8;
  const rightPadding = 3;
  const availableWidth = screenWidth - yAxisWidth - 40 - leftPadding - rightPadding;
  const spacing = availableWidth / (dataLength - 1);
  const chartWidth = availableWidth + leftPadding + rightPadding;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ width: yAxisWidth, justifyContent: 'space-between', paddingVertical: 5, alignItems: 'flex-end' }}>
        {yAxisValues.slice().reverse().map((val, idx) => (
          <Text key={idx} style={{ color: '#550000', fontSize: 10 }}>{Math.round(val)}</Text>
        ))}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <LineChart
          data={data}
          width={chartWidth}
          height={140}
          color="#550000"
          thickness={4}
          showVerticalLines={false}
          hideDataPoints
          hideYAxisText
          yAxisColor="transparent"
          yAxisThickness={0}
          hideRules={true}
          xAxisColor="#550000"
          xAxisThickness={1}
          spacing={spacing}
          initialSpacing={leftPadding}
          endSpacing={rightPadding}
          maxValue={roundedMax}
          noOfSections={4}
          pointerConfig={{
            pointerStripHeight: 100,
            pointerStripColor: 'rgba(85, 0, 0, 0.5)',
            pointerStripWidth: 2,
            pointerColor: '#550000',
            radius: 5,
            activatePointersOnLongPress: false,
            autoAdjustPointerLabelPosition: false,
            shiftPointerLabelY: 15,
            pointerLabelComponent: (items: any) => (
              <View style={{ backgroundColor: '#1a1a1a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: '#B8860B', fontSize: 10 }}>{items[0].value}</Text>
              </View>
            ),
          }}
        />
      </View>
    </View>
  );
}
