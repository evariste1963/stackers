import * as Device from 'expo-device';
import { Text, Image, View, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { globalStyles } from '@/styles/global';
import { StyledText } from '@/components/StyledText';
import { DateTime } from '@/components/DateTime';

export default function HomeScreen() {
  return (
    < SafeAreaProvider style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('@assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Stackers</Text>
      </View>
      <View style={globalStyles.boxes}>
        <StyledText>Runing on: {Platform.OS}</StyledText>
        <StyledText>Device Model: {Device.modelName}</StyledText>
        <StyledText>Device Brand: {Device.brand}</StyledText>
        <StyledText>OS Version: {Device.osVersion}</StyledText>
      </View>
      <DateTime />
    </SafeAreaProvider>
  );
}
