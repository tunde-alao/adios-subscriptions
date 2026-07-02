import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { formatPreviousSet, type PreviousSet } from "@/lib/previous";
import type { DraftSet } from "@/providers/TemplateDraftProvider";

interface SetRowProps {
  index: number;
  set: DraftSet;
  /** Sets performed for this position in the last workout, if any. */
  previous?: PreviousSet | null;
  onChange: (patch: Partial<DraftSet>) => void;
  /** When provided, the last column becomes a toggleable completion checkbox. */
  onToggleComplete?: () => void;
}

export function SetRow({
  index,
  set,
  previous,
  onChange,
  onToggleComplete,
}: SetRowProps) {
  const completed = !!set.completed;
  const isActive = !!onToggleComplete;

  return (
    <View
      className={`flex-row items-center py-1.5 rounded-md ${
        completed ? "bg-green-50" : ""
      }`}
    >
      <View className="w-10 items-center">
        <View className="w-7 h-7 rounded-md bg-gray-100 items-center justify-center">
          <AppText className="text-gray-900 text-sm" fontWeight="bold">
            {index + 1}
          </AppText>
        </View>
      </View>

      <View className="flex-1 items-center">
        <AppText className="text-gray-400 text-sm">
          {formatPreviousSet(previous)}
        </AppText>
      </View>

      <View className="w-16 items-center">
        <TextInput
          value={set.weight ? String(set.weight) : ""}
          onChangeText={(text) =>
            onChange({ weight: text === "" ? 0 : Number(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#9ca3af"
          className="bg-gray-100 rounded-md text-center text-gray-900 font-din-rounded-regular w-14"
          style={{ height: 32, fontSize: 15 }}
        />
      </View>

      <View className="w-16 items-center">
        <TextInput
          value={set.reps ? String(set.reps) : ""}
          onChangeText={(text) =>
            onChange({ reps: text === "" ? 0 : Number(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#9ca3af"
          className="bg-gray-100 rounded-md text-center text-gray-900 font-din-rounded-regular w-14"
          style={{ height: 32, fontSize: 15 }}
        />
      </View>

      <View className="w-10 items-center">
        {isActive ? (
          <Pressable
            hitSlop={8}
            onPress={onToggleComplete}
            className={`w-7 h-7 rounded-md items-center justify-center ${
              completed ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={completed ? "#fff" : "#9ca3af"}
            />
          </Pressable>
        ) : (
          <AppText className="text-gray-300 text-base">—</AppText>
        )}
      </View>
    </View>
  );
}
