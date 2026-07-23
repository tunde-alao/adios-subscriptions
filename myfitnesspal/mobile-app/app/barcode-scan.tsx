import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { MEALS, type Meal } from "@/lib/constants";
import { getProductByBarcode } from "@/lib/openfoodfacts";

export default function BarcodeScanScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal: Meal = MEALS.includes(params.meal as Meal)
    ? (params.meal as Meal)
    : "breakfast";

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const scannedRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      setLoading(true);

      try {
        const item = await getProductByBarcode(data);
        if (!item) {
          Alert.alert(
            "Not found",
            "We couldn't find this product in Open Food Facts.",
            [{ text: "Try again", onPress: () => (scannedRef.current = false) }]
          );
          return;
        }

        router.replace({
          pathname: "/edit-entry",
          params: { meal, item: JSON.stringify(item) },
        });
      } catch {
        Alert.alert("Something went wrong", "Please try scanning again.", [
          { text: "OK", onPress: () => (scannedRef.current = false) },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [meal]
  );

  return (
    <View className="flex-1 bg-black">
      {permission?.granted ? (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8" style={{ gap: 16 }}>
          <Ionicons name="camera-outline" size={48} color="#fff" />
          <AppText className="text-white text-center text-base">
            Camera access is needed to scan barcodes.
          </AppText>
          <AppButton text="Allow Camera Access" onPress={requestPermission} />
        </View>
      )}

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <AppText className="text-white text-base" fontWeight="bold">
          Scan a Barcode
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {permission?.granted && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <View
            className="rounded-2xl border-2 border-white"
            style={{ width: 260, height: 160, opacity: 0.9 }}
          />
        </View>
      )}

      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <ActivityIndicator color="#fff" size="large" />
        </View>
      )}
    </View>
  );
}
