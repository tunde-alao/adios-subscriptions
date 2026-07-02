import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { TemplateCard } from "@/components/workout/TemplateCard";
import {
  EXAMPLE_TEMPLATES,
  exampleTemplateDescription,
} from "@/data/example-templates";
import { formatShortDate } from "@/lib/format";
import type { Template } from "@/lib/types";
import { useTemplates } from "@/providers/TemplatesProvider";

function templateDescription(template: Template): string {
  return template.exercises.map((exercise) => exercise.name).join(", ");
}

function TemplateGrid({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-3 mt-3">{children}</View>;
}

/**
 * Wrapper to keep the 2-column grid math simple: each cell is ~half width.
 */
function GridCell({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: "48%" }} className="grow">
      {children}
    </View>
  );
}

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { items: templates } = useTemplates();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-end px-5 pt-2">
        <Pressable hitSlop={8}>
          <Ionicons name="search" size={22} color="#016F47" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText className="text-gray-900 text-4xl mt-1" fontWeight="bold">
          Start Workout
        </AppText>

        <AppText className="text-gray-900 text-lg mt-5" fontWeight="bold">
          Quick Start
        </AppText>
        <AppButton
          text="Start an Empty Workout"
          className="mt-3"
          onPress={() => router.push("/active-workout")}
        />

        <View className="flex-row items-center justify-between mt-7">
          <AppText className="text-gray-900 text-2xl" fontWeight="bold">
            Templates
          </AppText>
          <View className="flex-row items-center gap-4">
            <Pressable
              hitSlop={8}
              className="flex-row items-center gap-1"
              onPress={() => router.push("/create-template")}
            >
              <Ionicons name="add" size={18} color="#016F47" />
              <AppText className="text-primary text-base" fontWeight="bold">
                Template
              </AppText>
            </Pressable>
            <Pressable hitSlop={8}>
              <Ionicons name="folder-outline" size={20} color="#016F47" />
            </Pressable>
          </View>
        </View>

        <AppText className="text-gray-500 text-sm mt-4" fontWeight="bold">
          My Templates ({templates.length})
        </AppText>
        {templates.length === 0 ? (
          <View className="mt-3 border border-dashed border-gray-300 rounded-2xl px-4 py-6 items-center">
            <AppText className="text-gray-500 text-center">
              No templates yet. Tap “Template” to create your first one.
            </AppText>
          </View>
        ) : (
          <TemplateGrid>
            {templates.map((template) => (
              <GridCell key={template.id}>
                <TemplateCard
                  title={template.name}
                  description={templateDescription(template)}
                  dateLabel={formatShortDate(template.updatedAt)}
                  onPress={() =>
                    router.push({
                      pathname: "/active-workout",
                      params: { templateId: template.id },
                    })
                  }
                  onPressMenu={() =>
                    router.push({
                      pathname: "/create-template",
                      params: { templateId: template.id },
                    })
                  }
                />
              </GridCell>
            ))}
          </TemplateGrid>
        )}

        <AppText className="text-gray-500 text-sm mt-6" fontWeight="bold">
          Example Templates ({EXAMPLE_TEMPLATES.length})
        </AppText>
        <TemplateGrid>
          {EXAMPLE_TEMPLATES.map((template) => (
            <GridCell key={template.id}>
              <TemplateCard
                title={template.name}
                description={exampleTemplateDescription(template)}
              />
            </GridCell>
          ))}
        </TemplateGrid>
      </ScrollView>
    </View>
  );
}
