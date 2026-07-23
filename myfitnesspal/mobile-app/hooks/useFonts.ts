import { useFonts as useExpoFonts } from "expo-font";

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    "din-rounded": require("../assets/fonts/din-next-rounded-regular.ttf"),
    "din-rounded-bold": require("../assets/fonts/din-next-rounded-bold.ttf"),
  });

  return { fontsLoaded, fontError };
}
