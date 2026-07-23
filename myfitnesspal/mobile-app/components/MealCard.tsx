import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { colors as appColors, MEAL_LABELS, type Meal } from "@/lib/constants";
import { getEntryTotals, type FoodEntry } from "@/providers/DiaryProvider";

const MEAL_ICONS: Record<Meal, keyof typeof Ionicons.glyphMap> = {
  breakfast: "cafe-outline",
  lunch: "fast-food-outline",
  dinner: "restaurant-outline",
  snacks: "nutrition-outline",
};

interface MealCardProps {
  meal: Meal;
  entries: FoodEntry[];
  onLog: () => void;
  onPressEntry: (entry: FoodEntry) => void;
  onClear: () => void;
}

export function MealCard({ meal, entries, onLog, onPressEntry, onClear }: MealCardProps) {
  const hasEntries = entries.length > 0;
  const totalCalories = entries.reduce(
    (sum, entry) => sum + getEntryTotals(entry).calories,
    0
  );
  const extraCount = entries.length - 1;

  return (
    <Pressable
      onPress={() => hasEntries && onPressEntry(entries[0])}
      className="bg-white rounded-2xl px-4 py-4 flex-row items-center"
      style={{ gap: 12 }}
    >
      <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
        <Ionicons name={MEAL_ICONS[meal]} size={18} color={appColors.primary} />
      </View>

      <View className="flex-1">
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          {MEAL_LABELS[meal]}
        </AppText>
        {hasEntries && (
          <>
            <AppText className="text-gray-400 text-sm mt-0.5" numberOfLines={1}>
              {entries[0].name}
              {extraCount > 0 ? ` and ${extraCount} more` : ""}
            </AppText>
            <AppText className="text-gray-400 text-xs mt-0.5">
              {Math.round(totalCalories)} cal
            </AppText>
          </>
        )}
      </View>

      {hasEntries && (
        <Pressable hitSlop={8} onPress={onClear}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
        </Pressable>
      )}

      <Pressable onPress={onLog} className="bg-blue-50 px-4 py-2 rounded-full">
        <AppText className="text-primary text-sm" fontWeight="bold">
          Log
        </AppText>
      </Pressable>
    </Pressable>
  );
}
