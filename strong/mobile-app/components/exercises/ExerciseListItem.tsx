import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { ExerciseAvatar } from "./ExerciseAvatar";
import type { Exercise } from "@/data/exercises";

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress?: () => void;
  selected?: boolean;
  showChevron?: boolean;
}

export function ExerciseListItem({
  exercise,
  onPress,
  selected,
  showChevron,
}: ExerciseListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 gap-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <ExerciseAvatar name={exercise.name} bodyPart={exercise.bodyPart} />

      <View className="flex-1">
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          {exercise.name}
        </AppText>
        <AppText className="text-gray-500 text-sm mt-0.5">
          {exercise.bodyPart}
        </AppText>
      </View>

      {selected ? (
        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      ) : null}
    </Pressable>
  );
}
