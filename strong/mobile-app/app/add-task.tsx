import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { OutlineButton } from "@/components/OutlineButton";
import { useAuth } from "@/providers/AuthProvider";
import { useTasks, type Task } from "@/providers/TasksProvider";
import { api } from "@/lib/api";
import { uploadMedia } from "@/lib/upload-image";
import { colors as appColors } from "@/lib/constants";

const TASK_IMAGES_BUCKET = "task-images";

export default function AddTask() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to add a photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      setImageUri(result.assets[0].uri);
    } catch {
      Alert.alert(
        "Error",
        "Could not open the photo library. Please try again."
      );
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const trimmedTitle = title.trim();
  const canSave = !submitting && trimmedTitle.length > 0;

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in to add a task.");
      return;
    }
    if (!canSave) return;

    try {
      setSubmitting(true);
      console.log("[handleSave] start", { hasImage: !!imageUri });

      let uploadedImagePath: string | undefined;

      if (imageUri) {
        const ext = imageUri.split(".").pop()?.toLowerCase() ?? "jpg";
        const contentType =
          ext === "png"
            ? "image/png"
            : ext === "heic"
              ? "image/heic"
              : "image/jpeg";

        uploadedImagePath = await uploadMedia(
          imageUri,
          TASK_IMAGES_BUCKET,
          `${user.id}/${Crypto.randomUUID()}`,
          contentType,
          ext
        );
        console.log("[handleSave] uploaded", { uploadedImagePath });
      }

      console.log("[handleSave] creating task");
      const response = await api.api.tasks.$post({
        json: {
          title: trimmedTitle,
          imagePath: uploadedImagePath,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error("Failed to create task", {
          status: response.status,
          body,
        });
        throw new Error(`Failed to create task (${response.status})`);
      }

      const created = (await response.json()) as Task;
      addTask(created);
      router.back();
    } catch (err) {
      console.error("Failed to create task", err);
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 mt-5 flex-row items-start gap-3">
            <View style={{ width: 80, height: 80 }}>
              {imageUri ? (
                <View className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={handleRemoveImage}
                    className="absolute top-1 right-1"
                    hitSlop={8}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </View>
                  </Pressable>
                </View>
              ) : (
                <OutlineButton
                  onPress={handlePickImage}
                  className="w-full h-full"
                  contentClassName="w-full h-full items-center justify-center px-2 py-2"
                >
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={appColors.primary}
                  />
                  <AppText
                    className="text-primary text-sm mt-1"
                    fontWeight="bold"
                  >
                    Add
                  </AppText>
                </OutlineButton>
              )}
            </View>

            <View className="flex-1">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What do you need to do?"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                className="bg-white text-gray-900 font-din-rounded-regular"
                style={{
                  minHeight: 80,
                  fontSize: 16,
                  lineHeight: 22,
                }}
              />
            </View>
          </View>
        </ScrollView>

        <View
          className="px-6 pt-3 border-t border-gray-200 bg-white"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
        >
          <AppButton
            onPress={handleSave}
            text="Add Task"
            className="w-full"
            disabled={!canSave}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
