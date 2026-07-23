import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";

export default function ProgressScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-mfp-bg" style={{ paddingTop: top }}>
      <View className="flex-1 items-center justify-center px-8">
        <AppText className="text-gray-400 text-base text-center">
          Not available in this version
        </AppText>
      </View>
    </View>
  );
}
