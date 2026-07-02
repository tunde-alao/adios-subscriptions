import { Modal, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";

interface OptionSheetProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string | null;
  /** Label used for the "clear filter" option at the top of the list. */
  allLabel?: string;
  onSelect: (value: string | null) => void;
  onClose: () => void;
}

export function OptionSheet({
  visible,
  title,
  options,
  selected,
  allLabel = "All",
  onSelect,
  onClose,
}: OptionSheetProps) {
  const insets = useSafeAreaInsets();

  const rows: { label: string; value: string | null }[] = [
    { label: allLabel, value: null },
    ...options.map((option) => ({ label: option, value: option })),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="bg-white rounded-t-3xl absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom + 8, maxHeight: "70%" }}
      >
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <AppText className="text-gray-900 text-lg" fontWeight="bold">
            {title}
          </AppText>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#111" />
          </Pressable>
        </View>
        <ScrollView>
          {rows.map((row) => {
            const isSelected = row.value === selected;
            return (
              <Pressable
                key={row.label}
                onPress={() => {
                  onSelect(row.value);
                  onClose();
                }}
                className="flex-row items-center justify-between px-5 py-3.5"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <AppText
                  className={`text-base ${
                    isSelected ? "text-primary" : "text-gray-800"
                  }`}
                  fontWeight={isSelected ? "bold" : "regular"}
                >
                  {row.label}
                </AppText>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color="#016F47" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
