import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  /** Optional icon shown in the top-right accent button (defaults to expand). */
  accentIcon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  /** Labels rendered down the right edge of the chart (e.g. axis values). */
  rightLabels?: string[];
}

export function DashboardCard({
  title,
  subtitle,
  accentIcon = "expand-outline",
  children,
  rightLabels,
}: DashboardCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <AppText className="text-gray-900 text-lg" fontWeight="bold">
            {title}
          </AppText>
          {subtitle && (
            <AppText className="text-gray-500 text-sm mt-0.5">
              {subtitle}
            </AppText>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable hitSlop={6}>
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name={accentIcon} size={15} color="#016F47" />
            </View>
          </Pressable>
          <Pressable hitSlop={6}>
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={15} color="#016F47" />
            </View>
          </Pressable>
        </View>
      </View>

      <View className="flex-row mt-4">
        <View className="flex-1">{children}</View>
        {rightLabels && rightLabels.length > 0 && (
          <View className="justify-between ml-2 py-1">
            {rightLabels.map((label) => (
              <AppText key={label} className="text-gray-400 text-[11px]">
                {label}
              </AppText>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
