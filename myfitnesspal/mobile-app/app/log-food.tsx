import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { AppText } from "@/components/AppText";
import { colors as appColors, MEAL_LABELS, MEALS, type Meal } from "@/lib/constants";
import { searchProducts, type FoodItem } from "@/lib/openfoodfacts";
import { useDiary } from "@/providers/DiaryProvider";

const SEARCH_TABS = ["All", "My Meals", "My Recipes", "My Foods"] as const;

const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}[] = [
  { key: "barcode", label: "Barcode scan", icon: "scan-outline" },
  { key: "voice", label: "Voice log", icon: "mic-outline" },
  { key: "meal-scan", label: "Meal scan", icon: "camera-outline" },
  { key: "quick-add", label: "Quick add", icon: "add-circle-outline" },
];

function FoodRow({
  item,
  added,
  onPress,
  onQuickAdd,
}: {
  item: FoodItem;
  added: boolean;
  onPress: () => void;
  onQuickAdd: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-2.5"
      style={{ gap: 10 }}
    >
      <View className="flex-1">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <AppText
            className="text-gray-900 text-base flex-shrink"
            fontWeight="bold"
            numberOfLines={1}
          >
            {item.name}
          </AppText>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={14} color="#2BC4A6" />
          )}
        </View>
        <AppText className="text-gray-400 text-sm mt-0.5" numberOfLines={1}>
          {Math.round(item.caloriesPerServing)} cal, {item.servingLabel}
          {item.brand ? ` · ${item.brand}` : ""}
        </AppText>
      </View>
      <Pressable hitSlop={10} onPress={onQuickAdd}>
        <View
          className={`w-7 h-7 rounded-full items-center justify-center ${
            added ? "bg-carbs" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name={added ? "checkmark" : "add"}
            size={18}
            color={added ? "#fff" : appColors.primary}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

export default function LogFoodScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string }>();
  const { addEntry, history } = useDiary();

  const initialMeal: Meal = MEALS.includes(params.meal as Meal)
    ? (params.meal as Meal)
    : "breakfast";

  const [meal, setMeal] = useState<Meal>(initialMeal);
  const [activeTab, setActiveTab] = useState<(typeof SEARCH_TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchProducts(query);
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleChangeMeal = () => {
    const options = MEALS.map((m) => ({
      text: MEAL_LABELS[m],
      onPress: () => setMeal(m),
    }));
    Alert.alert("Select a Meal", undefined, [
      ...options,
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleOpenItem = (item: FoodItem) => {
    router.push({
      pathname: "/edit-entry",
      params: { meal, item: JSON.stringify(item) },
    });
  };

  const handleQuickAdd = async (item: FoodItem) => {
    if (addedIds.has(item.id)) return;
    try {
      await addEntry({
        name: item.name,
        brand: item.brand,
        barcode: item.barcode,
        meal,
        servingLabel: item.servingLabel,
        numberOfServings: 1,
        caloriesPerServing: item.caloriesPerServing,
        carbsPerServing: item.carbsPerServing,
        fatPerServing: item.fatPerServing,
        proteinPerServing: item.proteinPerServing,
      });
      setAddedIds((prev) => new Set(prev).add(item.id));
      Toast.success("Food logged!");
    } catch {
      Toast.error("Could not log food");
    }
  };

  const historyItems = useMemo(
    () =>
      history.map((h, index) => ({
        id: h.barcode ?? `${h.name}-${index}`,
        barcode: h.barcode,
        name: h.name,
        brand: h.brand,
        verified: !!h.barcode,
        servingLabel: h.servingLabel,
        caloriesPerServing: h.caloriesPerServing,
        carbsPerServing: h.carbsPerServing,
        fatPerServing: h.fatPerServing,
        proteinPerServing: h.proteinPerServing,
      })) as FoodItem[],
    [history]
  );

  const isSearchMode = query.trim().length > 0;
  const listData = isSearchMode ? results : historyItems;

  return (
    <View className="flex-1 bg-mfp-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#111827" />
        </Pressable>
        <Pressable
          onPress={handleChangeMeal}
          className="flex-row items-center"
          style={{ gap: 4 }}
        >
          <AppText className="text-primary text-base" fontWeight="bold">
            {MEAL_LABELS[meal]}
          </AppText>
          <Ionicons name="chevron-down" size={16} color={appColors.primary} />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <View className="px-4 mt-1">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2.5" style={{ gap: 8 }}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Food"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-gray-900 font-din-rounded-regular"
            style={{ fontSize: 16 }}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      {!isSearchMode && (
        <View className="flex-row px-4 mt-4" style={{ gap: 20 }}>
          {SEARCH_TABS.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <AppText
                className={`text-sm pb-2 ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-400"
                }`}
                fontWeight={activeTab === tab ? "bold" : "regular"}
              >
                {tab}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}

      {!isSearchMode && (
        <View className="flex-row px-4 mt-4" style={{ gap: 10 }}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              className="flex-1 items-center border border-gray-200 rounded-2xl py-3"
              onPress={() => {
                if (action.key === "barcode") {
                  router.push({ pathname: "/barcode-scan", params: { meal } });
                }
              }}
            >
              <Ionicons name={action.icon} size={18} color={appColors.primary} />
              <AppText
                className="text-primary text-xs mt-1 text-center"
                fontWeight="bold"
              >
                {action.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <AppText className="text-gray-900 text-lg mb-2" fontWeight="bold">
            {isSearchMode ? "Search Results" : "History"}
          </AppText>
        }
        ListEmptyComponent={
          searching ? (
            <View className="items-center py-10">
              <ActivityIndicator color={appColors.primary} />
            </View>
          ) : isSearchMode ? (
            <AppText className="text-gray-400 text-center py-10">
              No results found.
            </AppText>
          ) : (
            <AppText className="text-gray-400 text-center py-10">
              Foods you log will show up here.
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <FoodRow
            item={item}
            added={addedIds.has(item.id)}
            onPress={() => handleOpenItem(item)}
            onQuickAdd={() => handleQuickAdd(item)}
          />
        )}
      />
    </View>
  );
}
