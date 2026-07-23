import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { DiaryProvider } from "../providers/DiaryProvider";
import ToastManager from "toastify-react-native";
import { useFonts } from "../hooks/useFonts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigator() {
  const { status, user } = useAuth();
  const { fontsLoaded, fontError } = useFonts();

  const isReady = (fontsLoaded || fontError) && status !== "loading";

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  const isAuthenticated = status === "authenticated";
  const needsOnboarding = isAuthenticated && !user!.isOnboardingComplete;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="magic-link" />
        <Stack.Screen name="magic-link-verify" />
      </Stack.Protected>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && !needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen
          name="log-food"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="barcode-scan"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="edit-entry"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DiaryProvider>
            <BottomSheetModalProvider>
              <RootNavigator />
              <ToastManager
                position="top"
                duration={4000}
                showProgressBar={false}
                useModal={false}
              />
            </BottomSheetModalProvider>
          </DiaryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
