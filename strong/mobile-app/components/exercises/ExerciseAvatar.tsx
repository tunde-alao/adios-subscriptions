import { View } from "react-native";
import { AppText } from "@/components/AppText";

const BODY_PART_COLORS: Record<string, string> = {
  Chest: "#EF4444",
  Back: "#3B82F6",
  Shoulders: "#F59E0B",
  Legs: "#8B5CF6",
  Arms: "#EC4899",
  Core: "#10B981",
  Cardio: "#06B6D4",
  "Full Body": "#6366F1",
  Olympic: "#F97316",
};

interface ExerciseAvatarProps {
  name: string;
  bodyPart?: string | null;
  size?: number;
}

export function ExerciseAvatar({
  name,
  bodyPart,
  size = 44,
}: ExerciseAvatarProps) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const backgroundColor =
    (bodyPart && BODY_PART_COLORS[bodyPart]) ?? "#9CA3AF";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
      }}
      className="items-center justify-center"
    >
      <AppText
        className="text-white"
        fontWeight="bold"
        style={{ fontSize: size * 0.42 }}
      >
        {letter}
      </AppText>
    </View>
  );
}
