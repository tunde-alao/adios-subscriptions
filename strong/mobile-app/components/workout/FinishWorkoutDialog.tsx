import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";

interface FinishWorkoutDialogProps {
  visible: boolean;
  /** Whether there are logged sets that have not been marked complete yet. */
  hasUnfinishedSets: boolean;
  saving?: boolean;
  onComplete: () => void;
  onCancelWorkout: () => void;
  onClose: () => void;
}

export function FinishWorkoutDialog({
  visible,
  hasUnfinishedSets,
  saving = false,
  onComplete,
  onCancelWorkout,
  onClose,
}: FinishWorkoutDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-8">
        <View className="w-full bg-white rounded-3xl px-6 pt-6 pb-5">
          <AppText className="text-center" style={{ fontSize: 32 }}>
            🎉
          </AppText>
          <AppText
            className="text-gray-900 text-xl text-center mt-2"
            fontWeight="bold"
          >
            Finish Workout?
          </AppText>
          <AppText className="text-gray-600 text-base text-center mt-2">
            {hasUnfinishedSets
              ? "There are valid sets in this workout that have not been marked as complete."
              : "You're all done. Save this workout to your history?"}
          </AppText>

          <Pressable
            onPress={onComplete}
            disabled={saving}
            className="bg-green-500 rounded-2xl py-4 mt-6 items-center"
            style={({ pressed }) => ({ opacity: saving || pressed ? 0.8 : 1 })}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText className="text-white text-base" fontWeight="bold">
                {hasUnfinishedSets ? "Complete Unfinished Sets" : "Finish Workout"}
              </AppText>
            )}
          </Pressable>

          <Pressable
            onPress={onCancelWorkout}
            disabled={saving}
            className="bg-red-50 rounded-2xl py-4 mt-3 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <AppText className="text-red-500 text-base" fontWeight="bold">
              Cancel Workout
            </AppText>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={saving}
            className="bg-gray-100 rounded-2xl py-4 mt-3 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <AppText className="text-gray-900 text-base" fontWeight="bold">
              Cancel
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
