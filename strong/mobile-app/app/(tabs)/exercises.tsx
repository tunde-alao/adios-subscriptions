import { useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { FilterChip } from "@/components/exercises/FilterChip";
import { ExerciseListItem } from "@/components/exercises/ExerciseListItem";
import { OptionSheet } from "@/components/OptionSheet";
import {
  BODY_PARTS,
  CATEGORIES,
  EXERCISES,
  type Exercise,
} from "@/data/exercises";
import { groupExercises } from "@/lib/group-exercises";

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "bodyPart" | "category">(null);

  const sections = useMemo(
    () => groupExercises(EXERCISES, { search, bodyPart, category }),
    [search, bodyPart, category]
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Pressable hitSlop={8}>
          <AppText className="text-primary text-base" fontWeight="bold">
            New
          </AppText>
        </Pressable>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#016F47" />
        </Pressable>
      </View>

      <View className="px-5 pt-1 pb-3">
        <AppText className="text-gray-900 text-4xl" fontWeight="bold">
          Exercises
        </AppText>
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
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
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
          <Pressable className="bg-gray-100 rounded-lg w-11 h-9 items-center justify-center">
            <Ionicons name="swap-vertical" size={18} color="#374151" />
          </Pressable>
        </View>
      </View>

      <SectionList<Exercise>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        className="flex-1 mt-2"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <View className="px-5 pt-3 pb-1 bg-white">
            <AppText className="text-gray-400 text-sm" fontWeight="bold">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <ExerciseListItem exercise={item} showChevron />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-gray-100 ml-16" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <Ionicons name="barbell-outline" size={56} color="#ddd" />
            <AppText className="text-gray-500 mt-3">No exercises found</AppText>
          </View>
        }
      />

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
