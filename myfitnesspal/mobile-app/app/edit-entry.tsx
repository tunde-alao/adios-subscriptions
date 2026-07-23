import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { AppText } from "@/components/AppText";
import { CalorieRing } from "@/components/CalorieRing";
import { colors as appColors, dailyGoals, MEAL_LABELS, MEALS, type Meal } from "@/lib/constants";
import type { FoodItem } from "@/lib/openfoodfacts";
import { useDiary } from "@/providers/DiaryProvider";

const DANGER = "#E11D48";

const WEIGHT_UNITS: Record<string, number> = {
  g: 1,
  gr: 1,
  gram: 1,
  grams: 1,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  kg: 1000,
};

const VOLUME_UNITS: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  litre: 1000,
  cup: 240,
  cups: 240,
  "fl oz": 29.5735,
  floz: 29.5735,
};

type Canonical = "weight" | "volume" | "unit";

interface ServingOption {
  label: string;
  canonicalGrams: number;
}

function parseServing(label: string): { amount: number; unit: string } {
  const m = label.trim().match(/([\d.]+)\s*(.*)$/);
  const amount = m ? parseFloat(m[1]) : 1;
  const unit = (m && m[2] ? m[2] : "serving").trim().toLowerCase();
  return { amount: amount > 0 ? amount : 1, unit: unit || "serving" };
}

function unitInfo(unit: string): { canonical: Canonical; factor: number } {
  if (unit in WEIGHT_UNITS) return { canonical: "weight", factor: WEIGHT_UNITS[unit] };
  if (unit in VOLUME_UNITS) return { canonical: "volume", factor: VOLUME_UNITS[unit] };
  return { canonical: "unit", factor: 1 };
}

function buildServingOptions(servingLabel: string): ServingOption[] {
  const { amount, unit } = parseServing(servingLabel);
  const { canonical, factor } = unitInfo(unit);
  const baseCanonicalGrams = amount * factor;

  const options: ServingOption[] = [
    { label: servingLabel, canonicalGrams: baseCanonicalGrams },
  ];

  if (canonical === "weight") {
    options.push(
      { label: "1 g", canonicalGrams: 1 },
      { label: "100 g", canonicalGrams: 100 },
      { label: "1 oz", canonicalGrams: WEIGHT_UNITS.oz }
    );
  } else if (canonical === "volume") {
    options.push(
      { label: "1 ml", canonicalGrams: 1 },
      { label: "100 ml", canonicalGrams: 100 },
      { label: "1 fl oz", canonicalGrams: VOLUME_UNITS["fl oz"] }
    );
  } else {
    options.push({ label: `1 ${unit}`, canonicalGrams: factor });
  }

  const seen = new Set<string>();
  return options.filter((o) => {
    if (seen.has(o.label)) return false;
    seen.add(o.label);
    return true;
  });
}

interface NutritionBase {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  verified: boolean;
  servingLabel: string;
  caloriesPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  proteinPerServing: number;
  fiberPerServing?: number;
  sugarsPerServing?: number;
  saturatedFatPerServing?: number;
  sodiumMgPerServing?: number;
}

function toIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function MacroColumn({
  label,
  pct,
  value,
  color,
}: {
  label: string;
  pct: number;
  value: number;
  color: string;
}) {
  return (
    <View className="items-start">
      <AppText className="text-xs" fontWeight="bold" style={{ color }}>
        {Math.round(pct)}%
      </AppText>
      <AppText className="text-gray-900 text-lg" fontWeight="bold">
        {Math.round(value * 10) / 10} g
      </AppText>
      <AppText className="text-gray-400 text-xs">{label}</AppText>
    </View>
  );
}

function GoalBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <View className="flex-1 items-center">
      <View className="h-1.5 w-full rounded-full bg-track-gray overflow-hidden mb-1.5">
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </View>
      <AppText className="text-gray-400 text-xs">{Math.round(pct)}%</AppText>
      <AppText className="text-gray-400 text-xs">{label}</AppText>
    </View>
  );
}

function NutritionRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
      <AppText className="text-gray-500 text-sm">{label}</AppText>
      <AppText className="text-gray-900 text-sm" fontWeight="bold">
        {value}
      </AppText>
    </View>
  );
}

export default function EditEntryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    meal?: string;
    item?: string;
    entryId?: string;
  }>();
  const { entries, selectedDate, addEntry, updateEntry } = useDiary();

  const existingEntry = params.entryId
    ? entries.find((e) => e.id === params.entryId)
    : undefined;

  const isEditing = !!existingEntry;

  const parsedItem: FoodItem | null = useMemo(
    () => (params.item ? (JSON.parse(params.item) as FoodItem) : null),
    [params.item]
  );

  const base: NutritionBase = useMemo(() => {
    if (existingEntry) {
      return {
        name: existingEntry.name,
        brand: existingEntry.brand,
        barcode: existingEntry.barcode,
        verified: !!existingEntry.barcode,
        servingLabel: existingEntry.servingLabel,
        caloriesPerServing: existingEntry.caloriesPerServing,
        carbsPerServing: existingEntry.carbsPerServing,
        fatPerServing: existingEntry.fatPerServing,
        proteinPerServing: existingEntry.proteinPerServing,
      };
    }
    if (parsedItem) return { ...parsedItem };
    return {
      name: "Food",
      verified: false,
      servingLabel: "1 serving",
      caloriesPerServing: 0,
      carbsPerServing: 0,
      fatPerServing: 0,
      proteinPerServing: 0,
    };
  }, [existingEntry, parsedItem]);

  const initialMeal: Meal | null =
    existingEntry?.meal ??
    (MEALS.includes(params.meal as Meal) ? (params.meal as Meal) : null);

  const [meal, setMeal] = useState<Meal | null>(initialMeal);
  const [servingsText, setServingsText] = useState(
    (existingEntry?.numberOfServings ?? 1).toString()
  );

  const servingOptions = useMemo(
    () => buildServingOptions(base.servingLabel),
    [base.servingLabel]
  );

  const baseCanonicalGrams = servingOptions[0]?.canonicalGrams || 1;

  const [serving, setServing] = useState<ServingOption>(
    () => servingOptions[0]
  );

  const servingScale = serving.canonicalGrams / baseCanonicalGrams;
  const [showNutritionFacts, setShowNutritionFacts] = useState(false);
  const [saving, setSaving] = useState(false);

  const dayStripDays = useMemo(() => {
    const start = new Date(`${selectedDate}T00:00:00`);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set([selectedDate])
  );

  const toggleDay = (iso: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) {
        next.delete(iso);
      } else {
        next.add(iso);
      }
      return next;
    });
  };

  const numberOfServings = Math.max(0, parseFloat(servingsText) || 0);

  const multiplier = servingScale * numberOfServings;

  const totals = useMemo(() => {
    return {
      calories: base.caloriesPerServing * multiplier,
      carbs: base.carbsPerServing * multiplier,
      fat: base.fatPerServing * multiplier,
      protein: base.proteinPerServing * multiplier,
    };
  }, [base, multiplier]);

  const macroCalorieBreakdown = useMemo(() => {
    const carbCals = totals.carbs * 4;
    const fatCals = totals.fat * 9;
    const proteinCals = totals.protein * 4;
    const sum = carbCals + fatCals + proteinCals;
    if (sum <= 0) return { carbs: 0, fat: 0, protein: 0 };
    return {
      carbs: (carbCals / sum) * 100,
      fat: (fatCals / sum) * 100,
      protein: (proteinCals / sum) * 100,
    };
  }, [totals]);

  const goalPct = {
    calories: (totals.calories / dailyGoals.calories) * 100,
    carbs: (totals.carbs / dailyGoals.carbs) * 100,
    fat: (totals.fat / dailyGoals.fat) * 100,
    protein: (totals.protein / dailyGoals.protein) * 100,
  };

  const handleChangeMeal = () => {
    const options = MEALS.map((m) => ({
      text: MEAL_LABELS[m],
      onPress: () => setMeal(m),
    }));
    Alert.alert("Meal", undefined, [...options, { text: "Cancel", style: "cancel" }]);
  };

  const handleChangeServing = () => {
    const options = servingOptions.map((opt) => ({
      text: opt.label,
      onPress: () => setServing(opt),
    }));
    Alert.alert("Serving Size", undefined, [
      ...options,
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (numberOfServings <= 0) {
      Alert.alert("Invalid servings", "Please enter a number of servings greater than 0.");
      return;
    }
    if (!meal) {
      Alert.alert("Select a Meal", "Please choose which meal to log this food to.");
      return;
    }

    const perServing = {
      caloriesPerServing: base.caloriesPerServing * servingScale,
      carbsPerServing: base.carbsPerServing * servingScale,
      fatPerServing: base.fatPerServing * servingScale,
      proteinPerServing: base.proteinPerServing * servingScale,
    };

    setSaving(true);
    try {
      if (existingEntry) {
        await updateEntry(existingEntry.id, {
          meal,
          numberOfServings,
          servingLabel: serving.label,
          ...perServing,
        });
      } else {
        const days = selectedDays.size > 0 ? [...selectedDays] : [selectedDate];
        for (const loggedDate of days) {
          await addEntry({
            name: base.name,
            brand: base.brand,
            barcode: base.barcode,
            meal,
            servingLabel: serving.label,
            numberOfServings,
            ...perServing,
            loggedDate,
          });
        }
      }
      Toast.success("Food logged!");
      router.dismissTo("/(tabs)");
    } catch {
      Toast.error("Could not save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: "#F6F7F9" }}
      >
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <AppText className="text-gray-900 text-base" fontWeight="bold">
          {isEditing ? "Edit Entry" : "Add Food"}
        </AppText>
        {isEditing ? (
          <Pressable hitSlop={8} onPress={handleSave} disabled={saving}>
            <Ionicons
              name="checkmark"
              size={24}
              color={saving ? "#9ca3af" : appColors.primary}
            />
          </Pressable>
        ) : (
          <Pressable hitSlop={8} onPress={handleSave} disabled={saving}>
            <AppText
              className="text-base"
              fontWeight="bold"
              style={{ color: saving ? "#9ca3af" : appColors.primary }}
            >
              Log
            </AppText>
          </Pressable>
        )}
      </View>

      {!isEditing && base.barcode && (
        <View className="px-5 py-3" style={{ backgroundColor: "#E4EEFB" }}>
          <AppText className="text-gray-700 text-sm" numberOfLines={1}>
            This barcode was matched to: “{base.name}”
          </AppText>
          <Pressable hitSlop={6} onPress={() => router.back()}>
            <AppText className="text-primary text-sm" fontWeight="bold">
              Find a better match
            </AppText>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5 pb-4">
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <AppText
              className="text-gray-900 text-2xl flex-shrink"
              fontWeight="bold"
              numberOfLines={2}
            >
              {base.name}
            </AppText>
            {base.verified && (
              <Ionicons name="checkmark-circle" size={18} color="#2BC4A6" />
            )}
          </View>
          {!!base.brand && (
            <AppText className="text-gray-400 text-sm mt-1">{base.brand}</AppText>
          )}
        </View>

        <View className="h-px bg-gray-100" />

        <View className="px-5">
          <Pressable
            onPress={handleChangeServing}
            className="flex-row items-center justify-between py-4"
          >
            <AppText className="text-gray-800 text-base">Serving Size</AppText>
            <View className="border border-gray-300 rounded-lg px-4 py-2" style={{ minWidth: 100 }}>
              <AppText className="text-primary text-sm text-right" fontWeight="bold">
                {serving.label}
              </AppText>
            </View>
          </Pressable>

          <View className="flex-row items-center justify-between py-4">
            <AppText className="text-gray-800 text-base">Number of Servings</AppText>
            <View className="border border-gray-300 rounded-lg px-4 py-2" style={{ minWidth: 100 }}>
              <TextInput
                value={servingsText}
                onChangeText={setServingsText}
                keyboardType="decimal-pad"
                className="text-primary text-sm text-right font-din-rounded-bold"
                style={{ padding: 0, color: appColors.primary }}
              />
            </View>
          </View>

          <Pressable
            onPress={handleChangeMeal}
            className="flex-row items-center justify-between py-4"
          >
            <AppText className="text-gray-800 text-base">Meal</AppText>
            <View className="border border-gray-300 rounded-lg px-4 py-2" style={{ minWidth: 100 }}>
              <AppText
                className="text-sm text-right"
                fontWeight="bold"
                style={{ color: meal ? appColors.primary : DANGER }}
              >
                {meal ? MEAL_LABELS[meal] : "Select a Meal"}
              </AppText>
            </View>
          </Pressable>
        </View>

        {!isEditing && (
          <>
            <View className="px-5 pt-2 pb-1">
              <AppText className="text-gray-900 text-base" fontWeight="bold">
                Add to Multiple Days
              </AppText>
            </View>
            <View className="flex-row justify-between px-5 pt-3 pb-4">
              {dayStripDays.map((d) => {
                const iso = toIso(d);
                const isSelected = selectedDays.has(iso);
                const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <Pressable
                    key={iso}
                    onPress={() => toggleDay(iso)}
                    className="items-center"
                    hitSlop={4}
                  >
                    <AppText
                      className={`text-xs mb-1.5 ${
                        isSelected ? "text-gray-900" : "text-gray-400"
                      }`}
                      fontWeight={isSelected ? "bold" : "regular"}
                    >
                      {weekday}
                    </AppText>
                    <View
                      className={`w-9 h-9 rounded-full items-center justify-center ${
                        isSelected ? "bg-primary" : "bg-gray-100"
                      }`}
                    >
                      <AppText
                        className={`text-sm ${
                          isSelected ? "text-white" : "text-gray-900"
                        }`}
                        fontWeight="bold"
                      >
                        {d.getDate()}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View className="h-px bg-gray-100" />

        <View className="flex-row items-center px-5 py-6">
          <CalorieRing
            calories={totals.calories}
            segments={[
              { pct: macroCalorieBreakdown.carbs, color: appColors.carbs },
              { pct: macroCalorieBreakdown.fat, color: appColors.fat },
              { pct: macroCalorieBreakdown.protein, color: appColors.protein },
            ]}
          />
          <View className="flex-1 flex-row justify-between" style={{ marginLeft: 20 }}>
            <MacroColumn
              label="Carbs"
              pct={macroCalorieBreakdown.carbs}
              value={totals.carbs}
              color={appColors.carbs}
            />
            <MacroColumn
              label="Fat"
              pct={macroCalorieBreakdown.fat}
              value={totals.fat}
              color={appColors.fat}
            />
            <MacroColumn
              label="Protein"
              pct={macroCalorieBreakdown.protein}
              value={totals.protein}
              color={appColors.protein}
            />
          </View>
        </View>

        <View className="h-px bg-gray-100" />

        <View className="px-5 py-5">
          <AppText className="text-gray-900 text-base mb-3" fontWeight="bold">
            Percent of Daily Goals
          </AppText>
          <View className="flex-row" style={{ gap: 10 }}>
            <GoalBar label="Calories" pct={goalPct.calories} color={appColors.primary} />
            <GoalBar label="Carbs" pct={goalPct.carbs} color={appColors.carbs} />
            <GoalBar label="Fat" pct={goalPct.fat} color={appColors.fat} />
            <GoalBar label="Protein" pct={goalPct.protein} color={appColors.protein} />
          </View>
        </View>

        <View className="h-px bg-gray-100" />

        <Pressable
          onPress={() => setShowNutritionFacts((prev) => !prev)}
          className="flex-row items-center justify-between px-5 py-5"
        >
          <AppText className="text-gray-900 text-base" fontWeight="bold">
            Nutrition Facts
          </AppText>
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <AppText className="text-primary text-sm" fontWeight="bold">
              {showNutritionFacts ? "Hide" : "Show"}
            </AppText>
            <Ionicons
              name={showNutritionFacts ? "chevron-up" : "chevron-down"}
              size={16}
              color={appColors.primary}
            />
          </View>
        </Pressable>

        {showNutritionFacts && (
          <View className="px-5 pb-2">
            <NutritionRow label="Calories" value={`${Math.round(totals.calories)}`} />
            <NutritionRow
              label="Total Carbohydrates"
              value={`${Math.round(totals.carbs * 10) / 10} g`}
            />
            <NutritionRow label="Total Fat" value={`${Math.round(totals.fat * 10) / 10} g`} />
            <NutritionRow label="Protein" value={`${Math.round(totals.protein * 10) / 10} g`} />
            {base.saturatedFatPerServing !== undefined && (
              <NutritionRow
                label="Saturated Fat"
                value={`${Math.round(base.saturatedFatPerServing * multiplier * 10) / 10} g`}
              />
            )}
            {base.fiberPerServing !== undefined && (
              <NutritionRow
                label="Dietary Fiber"
                value={`${Math.round(base.fiberPerServing * multiplier * 10) / 10} g`}
              />
            )}
            {base.sugarsPerServing !== undefined && (
              <NutritionRow
                label="Sugars"
                value={`${Math.round(base.sugarsPerServing * multiplier * 10) / 10} g`}
              />
            )}
            {base.sodiumMgPerServing !== undefined && (
              <NutritionRow
                label="Sodium"
                value={`${Math.round(base.sodiumMgPerServing * multiplier)} mg`}
              />
            )}
          </View>
        )}

        {!isEditing && (
          <View
            className="flex-row items-center justify-center mt-4 py-3"
            style={{ backgroundColor: "#F6F7F9", gap: 6 }}
          >
            <AppText className="text-gray-500 text-sm">
              Is this information incorrect?
            </AppText>
            <Pressable hitSlop={6}>
              <AppText className="text-primary text-sm" fontWeight="bold">
                Report Food
              </AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
