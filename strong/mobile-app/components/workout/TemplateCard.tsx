import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface TemplateCardProps {
  title: string;
  description: string;
  dateLabel?: string;
  onPress?: () => void;
  onPressMenu?: () => void;
}

export function TemplateCard({
  title,
  description,
  dateLabel,
  onPress,
  onPressMenu,
}: TemplateCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white rounded-2xl border border-gray-200 p-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 120 })}
    >
      <View className="flex-row items-start justify-between">
        <AppText
          className="text-gray-900 text-base flex-1"
          fontWeight="bold"
          numberOfLines={1}
        >
          {title}
        </AppText>
        <Pressable onPress={onPressMenu} hitSlop={8}>
          <View className="w-6 h-6 rounded-full bg-blue-50 items-center justify-center">
            <Ionicons name="ellipsis-horizontal" size={14} color="#016F47" />
          </View>
        </Pressable>
      </View>

      <AppText className="text-gray-500 text-sm mt-1 flex-1" numberOfLines={3}>
        {description}
      </AppText>

      {dateLabel && (
        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons name="time-outline" size={13} color="#9ca3af" />
          <AppText className="text-gray-400 text-xs">{dateLabel}</AppText>
        </View>
      )}
    </Pressable>
  );
}
