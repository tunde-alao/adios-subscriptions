import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppBarProps {
  title: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function AppBar({ title, rightAction }: AppBarProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className="pl-6 pr-4 flex-row items-center justify-between mt-2"
      style={{ paddingTop: top }}
    >
      <View className="flex-1">{title}</View>
      {rightAction != null && (
        <View className="">
          <View className="px-3 py-2">{rightAction}</View>
        </View>
      )}
    </View>
  );
}
