import { Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";
import { formatRestTimer } from "@/lib/format";

interface RestTimerProps {
  /** Rest length shown on the idle divider. */
  restSeconds: number;
  /** When true, renders the live countdown bar instead of the divider. */
  active: boolean;
  /** Seconds left on the countdown (only used while active). */
  remaining: number;
  /** Total seconds the bar fills against (only used while active). */
  totalSeconds: number;
  /** Opens the rest-timer controls. Provided only while active. */
  onPress?: () => void;
}

export function RestTimer({
  restSeconds,
  active,
  remaining,
  totalSeconds,
  onPress,
}: RestTimerProps) {
  if (!active) {
    return (
      <View className="flex-row items-center justify-center py-0.5 gap-2">
        <View className="flex-1 h-px bg-gray-200" />
        <AppText className="text-primary text-xs">
          {formatRestTimer(restSeconds)}
        </AppText>
        <View className="flex-1 h-px bg-gray-200" />
      </View>
    );
  }

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <Pressable
      onPress={onPress}
      className="py-1"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className="h-8 rounded-lg bg-blue-100 overflow-hidden justify-center">
        <View
          className="absolute left-0 top-0 bottom-0 bg-primary"
          style={{ width: `${progress * 100}%` }}
        />
        <AppText className="text-white text-sm text-center" fontWeight="bold">
          {formatRestTimer(remaining)}
        </AppText>
      </View>
    </Pressable>
  );
}
