import { globalStyles } from "@/styles/global";
import { Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/styles/global';

export default function AccountScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Account</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Link href="/api-settings" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>API Settings</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/settings" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={globalStyles.button}>
          <Text style={[globalStyles.buttonText, { color: colors.red }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView >
  );
}
