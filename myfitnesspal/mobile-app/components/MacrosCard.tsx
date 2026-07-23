import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";

interface MacroColumnProps {
  label: string;
  grams: number;
  goal: number;
  colorClassName: string;
}

function MacroColumn({ label, grams, goal, colorClassName }: MacroColumnProps) {
  const pct = Math.max(0, Math.min(grams / goal, 1));

  return (
    <View className="flex-1">
      <AppText className="text-gray-900 text-sm mb-1" fontWeight="bold">
        {label}
      </AppText>
      <View className="flex-row items-baseline mb-2">
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          {Math.round(grams)} g
        </AppText>
        <AppText className="text-gray-400 text-xs"> / {goal}</AppText>
      </View>
      <View className="h-1.5 rounded-full bg-track-gray overflow-hidden">
        <View
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${pct * 100}%` }}
        />
      </View>
    </View>
  );
}

interface MacrosCardProps {
  carbs: number;
  fat: number;
  protein: number;
  goals: { carbs: number; fat: number; protein: number };
}

export function MacrosCard({ carbs, fat, protein, goals }: MacrosCardProps) {
  return (
    <Card>
      <View className="flex-row justify-end -mt-1 -mr-1 mb-1">
        <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="swap-horizontal" size={14} color="#6b7280" />
        </View>
      </View>
      <View className="flex-row" style={{ gap: 16 }}>
        <MacroColumn label="Carbs" grams={carbs} goal={goals.carbs} colorClassName="bg-carbs" />
        <MacroColumn label="Fat" grams={fat} goal={goals.fat} colorClassName="bg-fat" />
        <MacroColumn label="Protein" grams={protein} goal={goals.protein} colorClassName="bg-protein" />
      </View>
    </Card>
  );
}
