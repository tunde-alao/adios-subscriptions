import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor="#016F47"
      backgroundColor="#FFFFFF"
      disableTransparentOnScrollEdge
      labelStyle={{
        default: { fontSize: 9, fontWeight: 400 },
        selected: { fontSize: 9, fontWeight: 600 },
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Profile</Label>
        <Icon
          sf={{ default: "person", selected: "person.fill" }}
          drawable="ic_menu_myplaces"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Label>History</Label>
        <Icon
          sf={{ default: "clock", selected: "clock.fill" }}
          drawable="ic_menu_recent_history"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout">
        <Label>Start Workout</Label>
        <Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          drawable="ic_input_add"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercises">
        <Label>Exercises</Label>
        <Icon
          sf={{ default: "dumbbell", selected: "dumbbell.fill" }}
          drawable="ic_menu_agenda"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
