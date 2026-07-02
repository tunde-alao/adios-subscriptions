import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  active,
  onPress,
  className,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        className={`flex-row items-center justify-center gap-1 rounded-lg px-3 py-2 ${
          active ? "bg-primary" : "bg-gray-100"
        }`}
      >
        <AppText
          className={`text-sm ${active ? "text-white" : "text-gray-800"}`}
          fontWeight="bold"
          numberOfLines={1}
        >
          {label}
        </AppText>
        <Ionicons
          name="chevron-down"
          size={14}
          color={active ? "#fff" : "#6b7280"}
        />
      </View>
    </Pressable>
  );
}
