import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface ProfileHeaderProps {
  name: string;
  workoutCount: number;
  onPress?: () => void;
}

export function ProfileHeader({
  name,
  workoutCount,
  onPress,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
        <AppText className="text-white text-xl" fontWeight="bold">
          {initials || "?"}
        </AppText>
      </View>
      <View className="flex-1">
        <AppText className="text-gray-900 text-lg" fontWeight="bold">
          {name}
        </AppText>
        <AppText className="text-gray-500 text-sm mt-0.5">
          {workoutCount} workouts
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );
}
