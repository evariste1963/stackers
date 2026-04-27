import { globalStyles } from '@/styles/global';
import { Link } from 'expo-router';
import { Text, Image, ScrollView, View } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import StackGrid from '@/components/StackGrid';
import { LineChart } from "react-native-gifted-charts";

const data = [
  { value: 10 },
  { value: 20 },
  { value: 22 },
  { value: 19 },
  { value: 19 },
  { value: 22 },
  { value: 25 },
  { value: 30 },
  { value: 85 },
  { value: 86 },
  { value: 76 },
  { value: 99 }
];


export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('@assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Stackers</Text>
      </View>
      <HomeHeader />
      <View style={{ flex: 1, flexDirection: 'column' }} >
        <View style={globalStyles.chart}>
          <LineChart
            data={data}
            areaChart
            color="rgba(134, 65, 244, 1)"
            startFillColor="rgba(0, 0, 0, 1)"
            startOpacity={1}
            thickness={2}
            showVerticalLines={false}
            showHorizontalLines={false}
            hideYAxisText={true}
            hideAxesAndRules={true}
          />
        </View>
        <StackGrid />
      </View>
    </ScrollView >
  );
}

