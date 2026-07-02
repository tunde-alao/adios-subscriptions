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
        <Label>Tasks</Label>
        <Icon
          sf={{ default: "checklist", selected: "checklist" }}
          drawable="ic_menu_agenda"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
