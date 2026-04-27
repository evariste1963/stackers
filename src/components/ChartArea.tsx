import { LineChart } from 'react-native-gifted-charts';

export default function ChartArea() {
  const data = [
    { value: 50 },
    { value: 80 },
    { value: 90 },
    { value: 70 }
  ];
  <LineChart
    data={data}
    areaChart
    color="rgba(134, 65, 244, 1)"
    startFillColor="rgba(134, 65, 244, 0.8)"
    startOpacity={0.8}
    thickness={2}
    showVerticalLines={false}
    showHorizontalLines={false}
    hideYAxisText={true}
    hideAxesAndRules={true}
  />
}
