import { globalStyles } from "@/styles/global";
import { Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Settings</Text>
    </View>
  );
}

