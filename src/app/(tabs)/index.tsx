import { globalStyles } from '@/styles/global';
import { Link } from 'expo-router';
import { Text, Image, ScrollView, View } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import StackGrid from '@/components/StackGrid';
import ChartArea from '@/components/ChartArea';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Stackers</Text>
      </View>
      <HomeHeader />
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={globalStyles.chart}>
          <ChartArea />
        </View>
        <StackGrid />
      </View>
    </ScrollView >
  );
}

