import { useMemo, useState } from "react";
import { Pressable, SectionList, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ExerciseListItem } from "@/components/exercises/ExerciseListItem";
import { FilterChip } from "@/components/exercises/FilterChip";
import { OptionSheet } from "@/components/OptionSheet";
import {
  BODY_PARTS,
  CATEGORIES,
  EXERCISES,
  EXERCISES_BY_ID,
  type Exercise,
} from "@/data/exercises";
import { groupExercises } from "@/lib/group-exercises";
import { useTemplateDraft } from "@/providers/TemplateDraftProvider";
import { useWorkoutSession } from "@/providers/WorkoutSessionProvider";

export default function SelectExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { target } = useLocalSearchParams<{ target?: string }>();
  const draft = useTemplateDraft();
  const session = useWorkoutSession();
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "bodyPart" | "category">(null);
  const [selected, setSelected] = useState<string[]>([]);

  const sections = useMemo(
    () => groupExercises(EXERCISES, { search, bodyPart, category }),
    [search, bodyPart, category]
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const exercises = selected
      .map((id) => EXERCISES_BY_ID[id])
      .filter((exercise): exercise is Exercise => !!exercise);
    if (target === "session") {
      session.addExercises(exercises);
    } else {
      draft.addExercises(exercises);
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <AppText className="text-primary text-base" fontWeight="bold">
            Cancel
          </AppText>
        </Pressable>
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          Add Exercise
        </AppText>
        <View style={{ width: 52 }} />
      </View>

      <View className="px-5">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-11">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-gray-900 font-din-rounded-regular"
            style={{ fontSize: 16 }}
          />
        </View>

        <View className="flex-row items-center gap-2 mt-3">
          <FilterChip
            label={bodyPart ?? "Any Body Part"}
            active={!!bodyPart}
            onPress={() => setSheet("bodyPart")}
            className="flex-1"
          />
          <FilterChip
            label={category ?? "Any Category"}
            active={!!category}
            onPress={() => setSheet("category")}
            className="flex-1"
          />
        </View>
      </View>

      <SectionList<Exercise>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        className="flex-1 mt-2"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => (
          <View className="px-5 pt-3 pb-1 bg-white">
            <AppText className="text-gray-400 text-sm" fontWeight="bold">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
            selected={selected.includes(item.id)}
            onPress={() => toggle(item.id)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-gray-100 ml-16" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <AppText className="text-gray-500">No exercises found</AppText>
          </View>
        }
      />

      {selected.length > 0 && (
        <View
          className="px-5 pt-3 border-t border-gray-200 bg-white"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
        >
          <AppButton
            text={`Add ${selected.length} Exercise${
              selected.length > 1 ? "s" : ""
            }`}
            onPress={handleAdd}
          />
        </View>
      )}

      <OptionSheet
        visible={sheet === "bodyPart"}
        title="Body Part"
        allLabel="Any Body Part"
        options={BODY_PARTS}
        selected={bodyPart}
        onSelect={setBodyPart}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === "category"}
        title="Category"
        allLabel="Any Category"
        options={CATEGORIES}
        selected={category}
        onSelect={setCategory}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
