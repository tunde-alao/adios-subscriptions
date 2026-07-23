import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { Alert, Pressable, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import type { Meal } from "@/lib/constants";

export interface AddMenuRef {
  present: () => void;
  dismiss: () => void;
}

interface AddMenuProps {
  meal?: Meal;
}

interface MenuTile {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  onPress?: () => void;
}

interface MenuRow {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const AddMenu = forwardRef<AddMenuRef, AddMenuProps>(function AddMenu(
  { meal },
  ref
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const close = useCallback(() => sheetRef.current?.dismiss(), []);

  const notAvailable = useCallback(() => {
    close();
    Alert.alert("Not available", "This feature is not available in this version.");
  }, [close]);

  const tiles: MenuTile[] = [
    {
      key: "log-food",
      label: "Log Food",
      icon: "search",
      bg: "#E7EEFE",
      color: "#1D63ED",
      onPress: () => {
        close();
        router.push({ pathname: "/log-food", params: meal ? { meal } : {} });
      },
    },
    {
      key: "barcode",
      label: "Barcode Scan",
      icon: "scan-outline",
      bg: "#FDE7EC",
      color: "#E1436B",
      onPress: () => {
        close();
        router.push({
          pathname: "/barcode-scan",
          params: meal ? { meal } : {},
        });
      },
    },
    {
      key: "voice",
      label: "Voice Log",
      icon: "mic-outline",
      bg: "#F1E9FB",
      color: "#7A3FB3",
      onPress: notAvailable,
    },
    {
      key: "meal-scan",
      label: "Meal Scan",
      icon: "camera-outline",
      bg: "#E1F7F2",
      color: "#0FA487",
      onPress: notAvailable,
    },
  ];

  const rows: MenuRow[] = [
    { key: "water", label: "Water", icon: "water", color: "#1D63ED" },
    { key: "weight", label: "Weight", icon: "bookmark", color: "#0FA487" },
    { key: "exercise", label: "Exercise", icon: "flame", color: "#F5A623" },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={{ borderRadius: 24, backgroundColor: "#EEF1F5" }}
    >
      <BottomSheetView>
        <View className="px-4 pt-2 pb-8">
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {tiles.map((tile) => (
              <Pressable
                key={tile.key}
                onPress={tile.onPress}
                disabled={!tile.onPress}
                style={{ width: "47%" }}
                className="bg-white rounded-2xl items-center justify-center py-6"
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: tile.bg }}
                >
                  <Ionicons name={tile.icon} size={20} color={tile.color} />
                </View>
                <AppText className="text-gray-900 text-sm" fontWeight="bold">
                  {tile.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View className="bg-white rounded-2xl mt-3">
            {rows.map((row, index) => (
              <Pressable
                key={row.key}
                onPress={notAvailable}
                className={`flex-row items-center px-4 py-4 ${
                  index > 0 ? "border-t border-gray-100" : ""
                }`}
                style={{ gap: 12 }}
              >
                <Ionicons name={row.icon} size={18} color={row.color} />
                <AppText className="text-gray-900 text-base">
                  {row.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
