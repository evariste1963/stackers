import { globalStyles } from '@/styles/global';
import { Link } from 'expo-router';
import { Text, Image, ScrollView, View } from 'react-native';
import HomeHeader from '@/components/HomeHeader';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('@assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Stackers</Text>
      </View>
      <HomeHeader />
    </ScrollView>
  );
}

