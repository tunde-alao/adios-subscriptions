import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { ExerciseBlock } from "@/components/template/ExerciseBlock";
import { FinishWorkoutDialog } from "@/components/workout/FinishWorkoutDialog";
import { formatShortDate, formatStopwatch } from "@/lib/format";
import { getPreviousSets } from "@/lib/previous";
import { useTemplates } from "@/providers/TemplatesProvider";
import { useWorkoutSession } from "@/providers/WorkoutSessionProvider";
import { useWorkouts } from "@/providers/WorkoutsProvider";

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const { items: templates } = useTemplates();
  const { items: workouts, createWorkout } = useWorkouts();
  const {
    session,
    startFromTemplate,
    startEmpty,
    addSet,
    removeExercise,
    updateSet,
    toggleComplete,
    hasUnfinishedSets,
    buildPayload,
    finish,
    discard,
  } = useWorkoutSession();

  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishVisible, setFinishVisible] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;

    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        initialised.current = true;
        startFromTemplate(template);
      }
      return;
    }

    initialised.current = true;
    startEmpty();
  }, [templateId, templates, startFromTemplate, startEmpty]);

  useEffect(() => {
    if (!session) return;
    const startedAtMs = new Date(session.startedAt).getTime();
    const tick = () =>
      setElapsed(Math.max(0, Math.round((Date.now() - startedAtMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const previousByExercise = useMemo(() => {
    const map: Record<string, ReturnType<typeof getPreviousSets>> = {};
    if (!session) return map;
    for (const exercise of session.exercises) {
      map[exercise.exerciseId] = getPreviousSets(workouts, exercise.exerciseId);
    }
    return map;
  }, [session, workouts]);

  const handleCompleteWorkout = async () => {
    const payload = buildPayload({ completeUnfinished: true });
    if (!payload || payload.exercises.length === 0) {
      setFinishVisible(false);
      Alert.alert(
        "Nothing to save",
        "Log at least one set before finishing your workout."
      );
      return;
    }
    try {
      setSaving(true);
      await createWorkout(payload);
      finish();
      setFinishVisible(false);
      router.back();
    } catch {
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelWorkout = () => {
    setFinishVisible(false);
    discard();
    router.back();
  };

  const handleClose = () => {
    Alert.alert("Discard workout?", "Your progress will not be saved.", [
      { text: "Keep going", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discard();
          router.back();
        },
      },
    ]);
  };

  if (!session) {
    return <View className="flex-1 bg-white" style={{ paddingTop: insets.top }} />;
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          hitSlop={8}
          onPress={handleClose}
          className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center"
        >
          <Ionicons name="timer-outline" size={20} color="#111" />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => setFinishVisible(true)}
          disabled={saving}
          className="bg-green-500 rounded-lg px-5 py-2.5"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          <AppText className="text-white text-base" fontWeight="bold">
            Finish
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
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-2">
            <AppText
              className="text-gray-900 flex-1"
              fontWeight="bold"
              style={{ fontSize: 28 }}
            >
              {session.name}
            </AppText>
            <View className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={15} color="#016F47" />
            </View>
          </View>

          <View className="flex-row items-center gap-2 mt-2">
            <Ionicons name="calendar-outline" size={15} color="#6b7280" />
            <AppText className="text-gray-600 text-sm">
              {formatShortDate(session.startedAt)}
            </AppText>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="time-outline" size={15} color="#6b7280" />
            <AppText className="text-gray-600 text-sm">
              {formatStopwatch(elapsed)}
            </AppText>
          </View>

          {session.exercises.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="barbell-outline" size={56} color="#ddd" />
              <AppText className="text-gray-500 text-center mt-3">
                Add exercises to start logging your sets.
              </AppText>
            </View>
          ) : (
            session.exercises.map((exercise) => (
              <ExerciseBlock
                key={exercise.key}
                exercise={exercise}
                previousSets={previousByExercise[exercise.exerciseId]}
                onAddSet={() => addSet(exercise.key)}
                onRemove={() => removeExercise(exercise.key)}
                onChangeSet={(index, patch) =>
                  updateSet(exercise.key, index, patch)
                }
                onToggleComplete={(index) =>
                  toggleComplete(exercise.key, index)
                }
              />
            ))
          )}

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/select-exercises",
                params: { target: "session" },
              })
            }
            className="bg-blue-50 rounded-xl py-3.5 mt-6 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AppText className="text-primary text-base" fontWeight="bold">
              Add Exercises
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <FinishWorkoutDialog
        visible={finishVisible}
        hasUnfinishedSets={hasUnfinishedSets}
        saving={saving}
        onComplete={handleCompleteWorkout}
        onCancelWorkout={handleCancelWorkout}
        onClose={() => setFinishVisible(false)}
      />
    </View>
  );
}
