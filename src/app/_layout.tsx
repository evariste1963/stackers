import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StackProvider } from "@/contexts/StackContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/styles/global";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { cleanOrphanedImages } from "@/services/stackStorage";

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
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='lock' />
      <Stack.Screen name='pin-management' />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackProvider>
        <AuthRouter />
      </StackProvider>
    </AuthProvider>
  );
}