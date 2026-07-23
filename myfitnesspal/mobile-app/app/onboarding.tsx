import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { NameStep } from "@/components/onboarding/NameStep";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refetchUser } = useAuth();

  const completeOnboarding = async () => {
    await refetchUser();
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <NameStep onComplete={completeOnboarding} />
    </View>
  );
}
