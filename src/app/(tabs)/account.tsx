import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import PageHeader from '@/components/PageHeader';
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
      <ScrollView style={globalStyles.tabPageContainer}>
        <PageHeader title="Account" />
        <View style={styles.section}>
          <Link href="/guide" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Guide</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/settings" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Settings</Text>
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
                style={[globalStyles.button, styles.dangerButton]}
                onPress={handleLogOut}
              >
                <Text style={[globalStyles.buttonText, styles.dangerButtonText]}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  dangerButton: {
    marginTop: 20,
    borderColor: colors.red,
    borderWidth: 1,
  },
  dangerButtonText: {
    color: colors.red,
  },
});