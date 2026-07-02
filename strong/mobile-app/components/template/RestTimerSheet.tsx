import { Keyboard, Modal, Pressable, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { formatRestTimer } from "@/lib/format";

/** Amount added/removed when tapping the − / + controls. */
const STEP_SECONDS = 15;

interface RestTimerSheetProps {
  visible: boolean;
  running: boolean;
  remaining: number;
  onTogglePause: () => void;
  onAdjust: (deltaSeconds: number) => void;
  onReset: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function RestTimerSheet({
  visible,
  running,
  remaining,
  onTogglePause,
  onAdjust,
  onReset,
  onSkip,
  onClose,
}: RestTimerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose} />
      <View
        className="bg-[#22262b] rounded-t-3xl absolute bottom-0 left-0 right-0 px-5 pt-6"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-stretch">
          <Pressable
            onPress={onTogglePause}
            className="w-44 h-44 rounded-full bg-white/5 items-center justify-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AppText className="text-white" fontWeight="bold" style={{ fontSize: 28 }}>
              {running ? "Pause" : "Resume"}
            </AppText>
            <AppText className="text-white/60 mt-1" style={{ fontSize: 16 }}>
              {formatRestTimer(remaining)}
            </AppText>
          </Pressable>

          <View className="flex-1 ml-5 justify-between">
            <Pressable
              onPress={() => Keyboard.dismiss()}
              className="h-14 rounded-2xl bg-white/10 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <MaterialIcons name="keyboard-hide" size={24} color="#fff" />
            </Pressable>

            <View className="flex-row h-14 rounded-2xl bg-white/10 overflow-hidden mt-3">
              <Pressable
                onPress={() => onAdjust(-STEP_SECONDS)}
                className="flex-1 items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons name="remove" size={26} color="#fff" />
              </Pressable>
              <View className="w-px bg-white/15" />
              <Pressable
                onPress={() => onAdjust(STEP_SECONDS)}
                className="flex-1 items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </Pressable>
            </View>

            <Pressable
              onPress={onReset}
              className="h-14 rounded-2xl bg-white/10 items-center justify-center mt-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <AppText className="text-white text-base" fontWeight="bold">
                Reset
              </AppText>
            </Pressable>

            <Pressable
              onPress={onSkip}
              className="h-14 rounded-2xl bg-blue-500 items-center justify-center mt-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <AppText className="text-white text-base" fontWeight="bold">
                Skip
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
