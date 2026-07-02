import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { ExerciseBlock } from "@/components/template/ExerciseBlock";
import { getPreviousSets } from "@/lib/previous";
import { useTemplateDraft } from "@/providers/TemplateDraftProvider";
import { useTemplates } from "@/providers/TemplatesProvider";
import { useWorkouts } from "@/providers/WorkoutsProvider";

export default function CreateTemplateScreen() {
  const insets = useSafeAreaInsets();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const draft = useTemplateDraft();
  const { items, createTemplate } = useTemplates();
  const { items: workouts } = useWorkouts();
  const [saving, setSaving] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    if (templateId) {
      const existing = items.find((t) => t.id === templateId);
      if (existing) {
        draft.reset();
        draft.setName(existing.name);
        draft.addExercises(
          existing.exercises.map((exercise) => ({
            id: exercise.exerciseId,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
          }))
        );
        return;
      }
    }
    draft.reset();
  }, [templateId, items, draft]);

  const handleSave = async () => {
    if (draft.exercises.length === 0) {
      Alert.alert(
        "Add an exercise",
        "Add at least one exercise before saving your template."
      );
      return;
    }
    try {
      setSaving(true);
      await createTemplate({
        name: draft.name.trim() || "New Template",
        exercises: draft.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          bodyPart: exercise.bodyPart ?? undefined,
          restSeconds: exercise.restSeconds,
          sets: exercise.sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
          })),
        })),
      });
      draft.reset();
      router.back();
    } catch {
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#111" />
        </Pressable>
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          New Template
        </AppText>
        <Pressable
          hitSlop={8}
          onPress={handleSave}
          disabled={saving}
          className="bg-primary rounded-lg px-4 py-2"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          <AppText className="text-white text-base" fontWeight="bold">
            Save
          </AppText>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 48}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-2">
            <TextInput
              value={draft.name}
              onChangeText={draft.setName}
              placeholder="New Template"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-gray-900 font-din-rounded-bold"
              style={{ fontSize: 28 }}
            />
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={15} color="#016F47" />
            </View>
          </View>

          {draft.exercises.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="barbell-outline" size={56} color="#ddd" />
              <AppText className="text-gray-500 text-center mt-3">
                Add exercises to build your template.
              </AppText>
            </View>
          ) : (
            draft.exercises.map((exercise) => (
              <ExerciseBlock
                key={exercise.key}
                exercise={exercise}
                previousSets={getPreviousSets(workouts, exercise.exerciseId)}
                onAddSet={() => draft.addSet(exercise.key)}
                onRemove={() => draft.removeExercise(exercise.key)}
                onChangeSet={(index, patch) =>
                  draft.updateSet(exercise.key, index, patch)
                }
              />
            ))
          )}

          <Pressable
            onPress={() => router.push("/select-exercises")}
            className="bg-blue-50 rounded-xl py-3.5 mt-6 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AppText className="text-primary text-base" fontWeight="bold">
              Add Exercises
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
