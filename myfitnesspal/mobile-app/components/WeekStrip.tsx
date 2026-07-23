import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

interface WeekStripProps {
  selectedDate: string;
  selectedDateHasEntries: boolean;
  onSelectDate: (date: string) => void;
}

export function WeekStrip({
  selectedDate,
  selectedDateHasEntries,
  onSelectDate,
}: WeekStripProps) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  const weekStart = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <View className="flex-row justify-between px-6 mt-5">
      {days.map((d, i) => {
        const iso = toIso(d);
        const isSelected = iso === selectedDate;
        const isChecked = isSelected && selectedDateHasEntries;

        return (
          <Pressable
            key={iso}
            onPress={() => onSelectDate(iso)}
            className="items-center"
            hitSlop={4}
          >
            <View className="w-1 h-1 rounded-full mb-1 bg-gray-900" style={{ opacity: isSelected ? 1 : 0 }} />
            <AppText
              className={`text-xs mb-1 ${isSelected ? "text-gray-900" : "text-gray-400"}`}
              fontWeight={isSelected ? "bold" : "regular"}
            >
              {DAY_LABELS[i]}
            </AppText>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center border ${
                isChecked
                  ? "bg-gray-900 border-gray-900"
                  : "border-gray-300 bg-transparent"
              }`}
            >
              {isChecked && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
