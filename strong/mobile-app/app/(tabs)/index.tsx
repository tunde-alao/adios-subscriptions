import { useCallback, useMemo } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { BarChart, type BarDatum } from "@/components/profile/BarChart";
import { DashboardCard } from "@/components/profile/DashboardCard";
import { LineChart } from "@/components/profile/LineChart";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { formatVolume } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkouts } from "@/providers/WorkoutsProvider";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEK_LABELS = ["", "", "", "", "", ""];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { items: workouts } = useWorkouts();

  const handleSettings = useCallback(() => {
    Alert.alert("Settings", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  }, [signOut]);

  const workoutsPerWeek = useMemo<BarDatum[]>(() => {
    const now = Date.now();
    const buckets = new Array(6).fill(0);
    for (const workout of workouts) {
      const diff = now - new Date(workout.startedAt).getTime();
      const weeksAgo = Math.floor(diff / WEEK_MS);
      if (weeksAgo >= 0 && weeksAgo < 6) {
        buckets[5 - weeksAgo] += 1;
      }
    }
    return buckets.map((value, index) => ({
      label: WEEK_LABELS[index],
      value,
    }));
  }, [workouts]);

  const volumeTrend = useMemo(() => {
    const recent = [...workouts]
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      )
      .slice(-8)
      .map((w) => w.totalVolume);
    return recent.length >= 2 ? recent : null;
  }, [workouts]);

  const maxVolume = volumeTrend ? Math.max(...volumeTrend) : 0;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 pt-2">
        <Pressable hitSlop={8} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={22} color="#016F47" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText className="text-gray-900 text-4xl mt-1 mb-5" fontWeight="bold">
          Profile
        </AppText>

        <ProfileHeader
          name={user?.fullName ?? "Athlete"}
          workoutCount={workouts.length}
        />

        <View className="flex-row items-center justify-between mt-7 mb-1">
          <AppText className="text-gray-900 text-xl" fontWeight="bold">
            Dashboard
          </AppText>
          <Pressable
            hitSlop={8}
            className="flex-row items-center gap-1 bg-blue-50 rounded-lg px-3 py-1.5"
          >
            <Ionicons name="add" size={16} color="#016F47" />
            <AppText className="text-primary text-sm" fontWeight="bold">
              Widget
            </AppText>
          </Pressable>
        </View>

        <View className="mt-3">
          <DashboardCard
            title="Total Volume"
            subtitle="Per Workout"
            rightLabels={
              volumeTrend
                ? [formatVolume(maxVolume), formatVolume(maxVolume / 2)]
                : undefined
            }
          >
            {volumeTrend ? (
              <LineChart data={volumeTrend} />
            ) : (
              <View className="h-[120px] items-center justify-center">
                <AppText className="text-gray-400 text-sm">
                  Not enough data yet
                </AppText>
              </View>
            )}
          </DashboardCard>
        </View>

        <View className="mt-4">
          <DashboardCard
            title="Workouts Per Week"
            subtitle="Activity"
            accentIcon="disc-outline"
            rightLabels={[
              `${Math.max(1, ...workoutsPerWeek.map((d) => d.value))}`,
              "0",
            ]}
          >
            <BarChart data={workoutsPerWeek} />
          </DashboardCard>
        </View>
      </ScrollView>
    </View>
  );
}
