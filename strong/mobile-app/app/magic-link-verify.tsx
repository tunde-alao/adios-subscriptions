import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { AppButton } from "@/components/AppButton";
import { supabase } from "@/lib/supabase";
import { Toast } from "toastify-react-native";

const CODE_LENGTH = 8;

export default function MagicLinkVerify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fullCode = code.join("");
  const isCodeComplete = fullCode.length === CODE_LENGTH;

  function handleChangeText(text: string, index: number) {
    const newCode = [...code];

    if (text.length > 1) {
      // Handle paste - distribute characters across inputs
      const chars = text.slice(0, CODE_LENGTH - index).split("");
      chars.forEach((char, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = text;
      setCode(newCode);

      if (text && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!isCodeComplete || !email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: "email",
      });

      if (error) {
        Toast.error(error.message);
        return;
      }
    } catch (e: any) {
      Toast.error("Verification failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        Toast.error(error.message);
        return;
      }

      Toast.success("Code resent!");
    } catch (e: any) {
      Toast.error("Failed to resend code.");
      console.error(e);
    } finally {
      setResending(false);
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
            Check your email
          </AppText>
          <AppText className="text-base text-gray-500 mt-2">
            We sent an 8-digit code to{" "}
            <AppText className="text-base font-semibold text-black">
              {email}
            </AppText>
          </AppText>

          {/* OTP Inputs */}
          <View className="flex-row justify-between mt-8 gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={code[index]}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={index === 0 ? CODE_LENGTH : 1}
                autoFocus={index === 0}
                className="flex-1 border border-gray-300 rounded-xl text-center text-xl text-black"
                style={{
                  height: 56,
                  fontFamily: "din-rounded",
                  fontSize: 22,
                }}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend */}
          <View className="flex-row items-center justify-center mt-6">
            <AppText className="text-sm text-gray-500">
              Didn't receive a code?{" "}
            </AppText>
            <Pressable onPress={handleResend} disabled={resending}>
              <AppText className="text-sm font-bold text-black">
                {resending ? "Sending..." : "Resend"}
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* Bottom Button */}
        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
          <AppButton
            text="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={!isCodeComplete}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
