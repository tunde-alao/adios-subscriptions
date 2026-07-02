import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import {
  formatDuration,
  formatVolume,
  formatWorkoutDate,
} from "@/lib/format";
import type { Workout } from "@/lib/types";

interface WorkoutHistoryCardProps {
  workout: Workout;
  onPressMenu?: () => void;
}

function Stat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon}
      <AppText className="text-gray-600 text-sm">{label}</AppText>
    </View>
  );
}

export function WorkoutHistoryCard({
  workout,
  onPressMenu,
}: WorkoutHistoryCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 px-4 py-4">
      <View className="flex-row items-start justify-between">
        <AppText className="text-gray-900 text-xl flex-1" fontWeight="bold">
          {workout.name}
        </AppText>
        <Pressable onPress={onPressMenu} hitSlop={8}>
          <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
            <Ionicons name="ellipsis-horizontal" size={16} color="#016F47" />
          </View>
        </Pressable>
      </View>

      <AppText className="text-gray-600 text-sm mt-1">
        {formatWorkoutDate(workout.startedAt)}
      </AppText>

      <View className="flex-row items-center gap-5 mt-2">
        <Stat
          icon={<Ionicons name="time-outline" size={16} color="#6b7280" />}
          label={formatDuration(workout.durationSeconds)}
        />
        <Stat
          icon={<Ionicons name="barbell-outline" size={16} color="#6b7280" />}
          label={formatVolume(workout.totalVolume)}
        />
        <Stat
          icon={<Ionicons name="trophy-outline" size={16} color="#6b7280" />}
          label={`${workout.prCount} PRs`}
        />
      </View>

      <View className="flex-row mt-3 mb-1">
        <AppText className="text-gray-500 text-sm flex-1" fontWeight="bold">
          Exercise
        </AppText>
        <AppText className="text-gray-500 text-sm w-28" fontWeight="bold">
          Best Set
        </AppText>
      </View>

      {workout.exercises.map((exercise) => (
        <View key={exercise.id} className="flex-row py-0.5">
          <AppText
            className="text-gray-800 text-[15px] flex-1"
            numberOfLines={1}
          >
            {exercise.setCount} × {exercise.name}
          </AppText>
          <AppText className="text-gray-800 text-[15px] w-28" numberOfLines={1}>
            {exercise.bestSet
              ? `${exercise.bestSet.weight} kg × ${exercise.bestSet.reps}`
              : "—"}
          </AppText>
        </View>
      ))}
    </View>
  );
}
