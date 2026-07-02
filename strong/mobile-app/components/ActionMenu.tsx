import { Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";

export interface ActionMenuItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionMenuProps {
  visible: boolean;
  title?: string;
  items: ActionMenuItem[];
  onClose: () => void;
}

export function ActionMenu({
  visible,
  title,
  items,
  onClose,
}: ActionMenuProps) {
  const insets = useSafeAreaInsets();

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
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        {title && (
          <View className="px-5 pt-4 pb-1">
            <AppText className="text-gray-900 text-lg" fontWeight="bold">
              {title}
            </AppText>
          </View>
        )}
        <View className="pt-1">
          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              className="flex-row items-center gap-3 px-5 py-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              {item.icon && (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.destructive ? "#ef4444" : "#111"}
                />
              )}
              <AppText
                className={`text-base ${
                  item.destructive ? "text-red-500" : "text-gray-900"
                }`}
                fontWeight="bold"
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onClose}
          className="mx-5 mt-2 bg-gray-100 rounded-2xl py-4 items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <AppText className="text-gray-900 text-base" fontWeight="bold">
            Cancel
          </AppText>
        </Pressable>
      </View>
    </Modal>
  );
}
