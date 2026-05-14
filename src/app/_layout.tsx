import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StackProvider } from "@/contexts/StackContext";
import { PriceProvider } from "@/contexts/PriceContext";
import { MetalProvider } from "@/contexts/MetalContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/styles/global";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { cleanOrphanedImages } from "@/services/stackStorage";
import { initAllTables } from "@/services/db";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function DbInitializer({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initAllTables().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return <>{children}</>;
}

function AuthRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    cleanOrphanedImages();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (router.canGoBack()) {
          router.replace('/');
        }
      } else {
        router.replace('/lock');
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='guide' />
      <Stack.Screen name='lock' />
      <Stack.Screen name='pin-management' />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <DbInitializer>
          <AuthProvider>
            <StackProvider>
              <PriceProvider>
                <MetalProvider>
                  <AuthRouter />
                </MetalProvider>
              </PriceProvider>
            </StackProvider>
          </AuthProvider>
        </DbInitializer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
