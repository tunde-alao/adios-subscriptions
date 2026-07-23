import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";

interface CaloriesCardProps {
  consumed: number;
  goal: number;
}

export function CaloriesCard({ consumed, goal }: CaloriesCardProps) {
  const left = Math.round(goal - consumed);
  const pct = Math.max(0, Math.min(consumed / goal, 1));

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-2">
        <AppText className="text-gray-500 text-sm">Calories</AppText>
        <AppText className="text-gray-400 text-sm">
          {Math.abs(left).toLocaleString()} {left < 0 ? "over" : "left"}
        </AppText>
      </View>
      <View className="flex-row items-baseline mb-3">
        <AppText className="text-gray-900 text-3xl" fontWeight="bold">
          {Math.round(consumed).toLocaleString()} cal
        </AppText>
        <AppText className="text-gray-400 text-base"> / {goal.toLocaleString()}</AppText>
      </View>
      <View className="h-2 rounded-full bg-track-gray overflow-hidden">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct * 100}%` }}
        />
      </View>
    </Card>
  );
}
