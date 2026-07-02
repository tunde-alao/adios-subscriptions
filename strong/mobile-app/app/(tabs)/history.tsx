import { useMemo, useState } from "react";
import { Alert, Pressable, SectionList, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionMenu } from "@/components/ActionMenu";
import { AppText } from "@/components/AppText";
import { WorkoutHistoryCard } from "@/components/history/WorkoutHistoryCard";
import { formatMonthHeader } from "@/lib/format";
import { useWorkouts } from "@/providers/WorkoutsProvider";
import type { Workout } from "@/lib/types";

interface MonthSection {
  title: string;
  data: Workout[];
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { items, refreshing, refresh, removeWorkout } = useWorkouts();
  const [menuWorkout, setMenuWorkout] = useState<Workout | null>(null);

  const confirmDelete = (workout: Workout) => {
    Alert.alert(
      "Delete workout?",
      `"${workout.name}" will be permanently removed from your history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeWorkout(workout.id),
        },
      ]
    );
  };

  const sections = useMemo<MonthSection[]>(() => {
    const map = new Map<string, Workout[]>();
    for (const workout of items) {
      const key = formatMonthHeader(workout.startedAt);
      const bucket = map.get(key);
      if (bucket) bucket.push(workout);
      else map.set(key, [workout]);
    }
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [items]);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-end px-5 pt-2">
        <Pressable hitSlop={8} className="flex-row items-center gap-1">
          <AppText className="text-primary text-base" fontWeight="bold">
            Calendar
          </AppText>
        </Pressable>
      </View>

      <View className="px-5 pt-1 pb-2">
        <AppText className="text-gray-900 text-4xl" fontWeight="bold">
          History
        </AppText>
      </View>

      <SectionList<Workout, MonthSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={refreshing}
        renderSectionHeader={({ section }) => (
          <AppText
            className="text-gray-500 text-sm pt-4 pb-2"
            fontWeight="bold"
          >
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => (
          <View className="mb-3">
            <WorkoutHistoryCard
              workout={item}
              onPressMenu={() => setMenuWorkout(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-24 px-6">
            <Ionicons name="time-outline" size={64} color="#ddd" />
            <AppText className="text-gray-900 text-xl mt-4" fontWeight="bold">
              No workouts yet
            </AppText>
            <AppText className="text-gray-500 text-center mt-2">
              Your completed workouts will show up here.
            </AppText>
          </View>
        }
      />

      <ActionMenu
        visible={!!menuWorkout}
        title={menuWorkout?.name}
        items={[
          {
            label: "Delete Workout",
            icon: "trash-outline",
            destructive: true,
            onPress: () => {
              if (menuWorkout) confirmDelete(menuWorkout);
            },
          },
        ]}
        onClose={() => setMenuWorkout(null)}
      />
    </View>
  );
}
