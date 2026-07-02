import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { SetRow } from "./SetRow";
import { RestTimer } from "./RestTimer";
import { RestTimerSheet } from "./RestTimerSheet";
import { formatRestTimer } from "@/lib/format";
import type { PreviousSet } from "@/lib/previous";
import type { DraftExercise, DraftSet } from "@/providers/TemplateDraftProvider";

/**
 * Live rest countdown for a single set. `endAt` drives the clock while running;
 * `remaining` is the frozen value used when paused (and mirrors the clock while
 * running so the bar and sheet stay in sync).
 */
interface RestState {
  index: number;
  totalSeconds: number;
  running: boolean;
  endAt: number;
  remaining: number;
}

interface ExerciseBlockProps {
  exercise: DraftExercise;
  onAddSet: () => void;
  onRemove: () => void;
  onChangeSet: (index: number, patch: Partial<DraftSet>) => void;
  /** Previous workout's sets, aligned by set index. */
  previousSets?: PreviousSet[];
  /** When provided, each set shows a completion checkbox (active workout mode). */
  onToggleComplete?: (index: number) => void;
}

function HeaderCell({
  label,
  className,
  icon,
}: {
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View className={`items-center ${className ?? ""}`}>
      {icon ?? (
        <AppText className="text-gray-500 text-xs" fontWeight="bold">
          {label}
        </AppText>
      )}
    </View>
  );
}

export function ExerciseBlock({
  exercise,
  onAddSet,
  onRemove,
  onChangeSet,
  previousSets,
  onToggleComplete,
}: ExerciseBlockProps) {
  const isActive = !!onToggleComplete;

  // Only one rest countdown runs per exercise at a time. `null` means every set
  // shows the plain rest divider.
  const [rest, setRest] = useState<RestState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Drive the countdown while it's running.
  useEffect(() => {
    if (!rest?.running) return;
    const tick = () =>
      setRest((prev) => {
        if (!prev?.running) return prev;
        const remaining = Math.max(0, Math.round((prev.endAt - Date.now()) / 1000));
        if (remaining <= 0) return null;
        return { ...prev, remaining };
      });
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [rest?.running, rest?.endAt]);

  // Close the controls once the countdown is gone.
  useEffect(() => {
    if (!rest) setSheetOpen(false);
  }, [rest]);

  const handleToggleComplete = useCallback(
    (index: number) => {
      const wasCompleted = !!exercise.sets[index]?.completed;
      if (wasCompleted) {
        // Un-checking a set cancels its running rest timer.
        setRest((prev) => (prev?.index === index ? null : prev));
      } else {
        const seconds = exercise.restSeconds;
        setRest({
          index,
          totalSeconds: seconds,
          running: true,
          endAt: Date.now() + seconds * 1000,
          remaining: seconds,
        });
      }
      onToggleComplete?.(index);
    },
    [exercise.sets, exercise.restSeconds, onToggleComplete]
  );

  const togglePause = useCallback(() => {
    setRest((prev) => {
      if (!prev) return prev;
      if (prev.running) {
        const remaining = Math.max(0, Math.round((prev.endAt - Date.now()) / 1000));
        return { ...prev, running: false, remaining };
      }
      return { ...prev, running: true, endAt: Date.now() + prev.remaining * 1000 };
    });
  }, []);

  const adjustRest = useCallback((deltaSeconds: number) => {
    setRest((prev) => {
      if (!prev) return prev;
      const remaining = Math.max(0, prev.remaining + deltaSeconds);
      const totalSeconds = Math.max(prev.totalSeconds, remaining);
      return prev.running
        ? { ...prev, remaining, totalSeconds, endAt: Date.now() + remaining * 1000 }
        : { ...prev, remaining, totalSeconds };
    });
  }, []);

  const resetRest = useCallback(() => {
    setRest((prev) =>
      prev
        ? {
            ...prev,
            running: true,
            totalSeconds: exercise.restSeconds,
            remaining: exercise.restSeconds,
            endAt: Date.now() + exercise.restSeconds * 1000,
          }
        : prev
    );
  }, [exercise.restSeconds]);

  const skipRest = useCallback(() => {
    setRest(null);
    setSheetOpen(false);
  }, []);

  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <AppText className="text-primary text-base flex-1" fontWeight="bold">
          {exercise.name}
        </AppText>
        <View className="flex-row items-center gap-2">
          <Pressable hitSlop={6}>
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="git-branch-outline" size={15} color="#016F47" />
            </View>
          </Pressable>
          <Pressable hitSlop={6} onPress={onRemove}>
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={15} color="#016F47" />
            </View>
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center mt-3">
        <HeaderCell label="Set" className="w-10" />
        <HeaderCell label="Previous" className="flex-1" />
        <HeaderCell label="+kg" className="w-16" />
        <HeaderCell label="Reps" className="w-16" />
        <HeaderCell
          className="w-10"
          icon={
            <Ionicons
              name={isActive ? "checkmark" : "lock-closed-outline"}
              size={14}
              color="#6b7280"
            />
          }
        />
      </View>

      {exercise.sets.map((set, index) => {
        const activeRest = isActive && rest?.index === index ? rest : null;
        return (
          <View key={index}>
            <SetRow
              index={index}
              set={set}
              previous={previousSets?.[index] ?? null}
              onChange={(patch) => onChangeSet(index, patch)}
              onToggleComplete={
                onToggleComplete ? () => handleToggleComplete(index) : undefined
              }
            />
            <RestTimer
              restSeconds={exercise.restSeconds}
              active={!!activeRest}
              remaining={activeRest?.remaining ?? exercise.restSeconds}
              totalSeconds={activeRest?.totalSeconds ?? exercise.restSeconds}
              onPress={activeRest ? () => setSheetOpen(true) : undefined}
            />
          </View>
        );
      })}

      <Pressable
        onPress={onAddSet}
        className="bg-gray-100 rounded-lg py-2.5 mt-1 items-center"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <AppText className="text-gray-700 text-sm" fontWeight="bold">
          + Add Set ({formatRestTimer(exercise.restSeconds)})
        </AppText>
      </Pressable>

      <RestTimerSheet
        visible={sheetOpen && !!rest}
        running={rest?.running ?? false}
        remaining={rest?.remaining ?? 0}
        onTogglePause={togglePause}
        onAdjust={adjustRest}
        onReset={resetRest}
        onSkip={skipRest}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}
