import { View, Pressable } from "react-native";
import { useRef, useCallback } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { AppText } from "@/components/AppText";
import SignInWithAppleButton from "../components/SignInWithAppleButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SignIn() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 50 }}>
        <View className="flex-1 w-full items-center justify-center">
          <View className="w-32 h-32 rounded-full bg-black items-center justify-center">
            <Ionicons name="checkmark-done" size={64} color="#FFFFFF" />
          </View>
        </View>

        <View
          className="w-full items-center gap-4 -mt-10"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <AppText className="text-[34px] font-extrabold text-center text-black leading-[42px] mb-4">
            Organize your day, one task at a time
          </AppText>

          <Pressable
            className="w-full bg-black py-[18px] rounded-full items-center"
            onPress={handleOpenSheet}
          >
            <AppText className="text-white text-lg font-bold">
              Get Started
            </AppText>
          </Pressable>

          <Pressable onPress={handleOpenSheet}>
            <AppText className="text-[15px] text-gray-500">
              Already have an account?{" "}
              <AppText className="font-bold text-black" fontWeight="bold">
                Sign In
              </AppText>
            </AppText>
          </Pressable>
        </View>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[320]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{ backgroundColor: "#DDDDDD", width: 40 }}
      >
        <BottomSheetView className="flex-1 items-center px-6 pt-4 gap-4">
          <AppText className="text-xl font-bold text-black">
            Continue with
          </AppText>
          <SignInWithAppleButton style={{ width: "100%", height: 56 }} />
          <Pressable
            onPress={() => {
              bottomSheetRef.current?.close();
              router.push("/magic-link");
            }}
            className="w-full flex-row items-center justify-center rounded-lg border border-gray-300 bg-white"
            style={{ height: 56 }}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />
            <AppText className="text-base font-semibold text-black">
              Continue with Email
            </AppText>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
