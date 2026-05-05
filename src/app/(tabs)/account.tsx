import { globalStyles } from "@/styles/global";
import { Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/styles/global';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

export default function AccountScreen() {
  const { hasPinSet, lock } = useAuth();
  const router = useRouter();
  const { swipeGesture } = useSwipeNavigation('account');

  function handleLogOut() {
    lock();
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <ScrollView style={globalStyles.container}>
        <View style={globalStyles.header}>
          <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>Account</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Link href="/guide" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Guide</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/api-settings" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>API Settings</Text>
            </TouchableOpacity>
          </Link>

          {!hasPinSet && (
            <TouchableOpacity 
              style={globalStyles.button} 
              onPress={() => router.push('/pin-management?mode=set')}
            >
              <Text style={globalStyles.buttonText}>Set PIN</Text>
            </TouchableOpacity>
          )}

          {hasPinSet && (
            <>
              <TouchableOpacity 
                style={globalStyles.button} 
                onPress={() => router.push('/pin-management?mode=change')}
              >
                <Text style={globalStyles.buttonText}>Change PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={globalStyles.button} 
                onPress={() => router.push('/pin-management?mode=remove')}
              >
                <Text style={globalStyles.buttonText}>Remove PIN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[globalStyles.button, { marginTop: 20, borderColor: colors.red, borderWidth: 1 }]} 
                onPress={handleLogOut}
              >
                <Text style={[globalStyles.buttonText, { color: colors.red }]}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </GestureDetector>
  );
}