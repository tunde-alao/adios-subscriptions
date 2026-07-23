import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { AppButton } from "@/components/AppButton";
import { supabase } from "@/lib/supabase";
import { Toast } from "toastify-react-native";

export default function MagicLink() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleContinue() {
    if (!isValidEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      console.log("error", error);

      if (error) {
        Toast.error(error.message);
        return;
      }

      router.push({
        pathname: "/magic-link-verify",
        params: { email: email.trim() },
      });
    } catch (e: any) {
      Toast.error("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-6">
          <AppText className="text-[28px] font-bold text-black leading-[34px]">
            Enter your email
          </AppText>
          <AppText className="text-base text-gray-500 mt-2">
            We'll send you a verification code to sign in.
          </AppText>

          <View className="mt-8">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-base text-black"
              style={{ fontFamily: "din-rounded", fontSize: 16 }}
            />
          </View>
        </View>

        {/* Bottom Button */}
        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
          <AppButton
            text="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!isValidEmail}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
