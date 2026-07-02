import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "@/components/AppBar";
import { AppText } from "@/components/AppText";
import { colors as appColors } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTasks, type Task } from "@/providers/TasksProvider";

function TaskRow({ item }: { item: Task }) {
  const { toggleTask, removeTask } = useTasks();

  return (
    <View className="flex-row items-center px-6 py-3 gap-3">
      <Pressable onPress={() => toggleTask(item.id)} hitSlop={8}>
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            item.completed
              ? "bg-primary border-primary"
              : "border-gray-300 bg-white"
          }`}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </Pressable>

      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 44, height: 44, borderRadius: 8 }}
          contentFit="cover"
        />
      )}

      <AppText
        className={`flex-1 text-base ${
          item.completed ? "text-gray-400 line-through" : "text-gray-900"
        }`}
      >
        {item.title}
      </AppText>

      <Pressable onPress={() => removeTask(item.id)} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color="#d1d5db" />
      </Pressable>
    </View>
  );
}

export default function TasksScreen() {
  const { items, loading, refreshing, refresh } = useTasks();
  const { signOut } = useAuth();

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  }, [signOut]);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskRow item={item} />,
    []
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const renderSeparator = useCallback(
    () => <View className="h-px bg-gray-200 mx-6" />,
    []
  );

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View className="items-center justify-center py-20">
          <ActivityIndicator color={appColors.primary} />
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20 px-6">
        <Ionicons name="checkmark-done-outline" size={64} color="#ddd" />
        <AppText className="text-gray-900 text-xl mt-4" fontWeight="bold">
          No tasks yet
        </AppText>
        <AppText className="text-gray-500 text-center mt-2">
          Tap the + button to add your first task.
        </AppText>
      </View>
    );
  }, [loading]);

  return (
    <View className="flex-1 bg-white">
      <AppBar
        title={
          <AppText className="text-gray-900 text-2xl" fontWeight="bold">
            Tasks
          </AppText>
        }
        rightAction={
          <View className="flex-row items-center gap-4">
            <Pressable hitSlop={8} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={26} color="#222" />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => router.push("/add-task")}>
              <Ionicons name="add-circle-outline" size={28} color="#222" />
            </Pressable>
          </View>
        }
      />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={appColors.primary}
          />
        }
      />
    </View>
  );
}
