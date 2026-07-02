import { View } from "react-native";
import { AppText } from "@/components/AppText";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  color?: string;
  mutedColor?: string;
}

export function BarChart({
  data,
  height = 120,
  color = "#7C3AED",
  mutedColor = "#C4B5FD",
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const lastIndex = data.length - 1;

  return (
    <View>
      <View
        className="flex-row items-end justify-between"
        style={{ height }}
      >
        {data.map((datum, index) => {
          const barHeight = Math.max(2, (datum.value / max) * height);
          return (
            <View key={datum.label + index} className="flex-1 items-center">
              <View
                style={{
                  height: barHeight,
                  width: "55%",
                  backgroundColor: index === lastIndex ? color : mutedColor,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between mt-2">
        {data.map((datum, index) => (
          <View key={datum.label + index} className="flex-1 items-center">
            <AppText className="text-gray-400 text-[11px]">
              {datum.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
