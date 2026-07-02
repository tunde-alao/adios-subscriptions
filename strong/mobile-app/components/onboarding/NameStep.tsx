import { useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { AppButton } from "@/components/AppButton";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface NameStepProps {
  onComplete: () => void;
}

export function NameStep({ onComplete }: NameStepProps) {
  const insets = useSafeAreaInsets();
  const { user, refetchUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const name = fullName.trim();

    if (!name) {
      setError("Please enter your full name");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const response = await api.api.me.$patch({
        json: { fullName: name, isOnboardingComplete: true },
      });

      if (!response.ok) {
        setError("Could not save your profile");
        return;
      }

      await refetchUser();
      onComplete();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white px-6"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="mt-6">
        <AppText
          className="text-[28px] font-extrabold text-black leading-[36px]"
          fontWeight="bold"
        >
          What should we call you?
        </AppText>
        <AppText className="text-base text-gray-500 mt-2 leading-6">
          Enter your name to get started.
        </AppText>
      </View>

      <View className="flex-1">
        <AppText className="text-gray-500 text-sm mb-2">Full name</AppText>
        <TextInput
          className="text-gray-900 text-lg py-3 border-b border-gray-200"
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            setError(null);
          }}
          placeholder="Jane Doe"
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!saving}
        />

        {error ? (
          <AppText className="text-red-500 text-sm mt-4">{error}</AppText>
        ) : null}
      </View>

      <View className="pb-6">
        <AppButton
          text="Continue"
          onPress={handleContinue}
          loading={saving}
          disabled={saving}
          className="w-full"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
