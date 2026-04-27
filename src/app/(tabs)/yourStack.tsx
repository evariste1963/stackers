import { globalStyles } from "@/styles/global";
import { Text, View, ScrollView, Image } from 'react-native';

export default function yourStackScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('@assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Your Stack</Text>
      </View>
    </ScrollView >
  );
}


