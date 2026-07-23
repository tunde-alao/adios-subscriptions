import { useRef } from "react";
import { Pressable, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { AppText } from "@/components/AppText";
import { AddMenu, type AddMenuRef } from "@/components/AddMenu";
import { colors } from "@/lib/constants";

type TabMeta = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TAB_META: Record<string, TabMeta> = {
  index: { label: "Today", icon: "home-outline", iconActive: "home" },
  plan: { label: "Plan", icon: "calendar-outline", iconActive: "calendar" },
  progress: {
    label: "Progress",
    icon: "stats-chart-outline",
    iconActive: "stats-chart",
  },
  more: {
    label: "More",
    icon: "ellipsis-horizontal",
    iconActive: "ellipsis-horizontal",
  },
};

function TabBar({
  state,
  navigation,
  onAddPress,
}: BottomTabBarProps & { onAddPress: () => void }) {
  const { bottom } = useSafeAreaInsets();

  const renderTab = (route: BottomTabBarProps["state"]["routes"][number], index: number) => {
    const meta = TAB_META[route.name];
    if (!meta) return null;

    const focused = state.index === index;
    const color = focused ? colors.primary : colors["muted-foreground"];

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        className="flex-1 items-center justify-center"
        style={{ gap: 3 }}
      >
        <Ionicons
          name={focused ? meta.iconActive : meta.icon}
          size={24}
          color={color}
        />
        <AppText
          className="text-[10px]"
          fontWeight={focused ? "bold" : "regular"}
          style={{ color }}
        >
          {meta.label}
        </AppText>
      </Pressable>
    );
  };

  const left = state.routes.slice(0, 2).map((route, i) => renderTab(route, i));
  const right = state.routes
    .slice(2)
    .map((route, i) => renderTab(route, i + 2));

  return (
    <View
      className="flex-row bg-white border-t border-gray-100"
      style={{ paddingBottom: bottom, paddingTop: 8 }}
    >
      {left}
      <View className="flex-1 items-center justify-center">
        <Pressable
          onPress={onAddPress}
          hitSlop={8}
          className="w-14 h-14 rounded-full bg-primary items-center justify-center"
          style={{
            marginTop: -24,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </View>
      {right}
    </View>
  );
}

export default function TabsLayout() {
  const addMenuRef = useRef<AddMenuRef>(null);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <TabBar
            {...props}
            onAddPress={() => addMenuRef.current?.present()}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="plan" />
        <Tabs.Screen name="progress" />
        <Tabs.Screen name="more" />
      </Tabs>
      <AddMenu ref={addMenuRef} />
    </>
  );
}
