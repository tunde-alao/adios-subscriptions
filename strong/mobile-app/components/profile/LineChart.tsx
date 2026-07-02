import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

interface LineChartProps {
  data: number[];
  height?: number;
  color?: string;
}

/**
 * Minimal dependency-free line chart. Draws points and connects consecutive
 * points with thin rotated segments. Good enough for a dashboard sparkline
 * without pulling in react-native-svg.
 */
export function LineChart({
  data,
  height = 120,
  color = "#7C3AED",
}: LineChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const padding = 8;
  const innerHeight = height - padding * 2;
  const innerWidth = Math.max(0, width - padding * 2);

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x =
      data.length <= 1
        ? padding
        : padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - min) / range) * innerHeight;
    return { x, y };
  });

  return (
    <View style={{ height }} onLayout={onLayout}>
      {width > 0 &&
        points.map((point, index) => {
          if (index === points.length - 1) return null;
          const next = points[index + 1];
          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const midX = (point.x + next.x) / 2;
          const midY = (point.y + next.y) / 2;
          return (
            <View
              key={`seg-${index}`}
              style={{
                position: "absolute",
                left: midX - length / 2,
                top: midY - 1.25,
                width: length,
                height: 2.5,
                backgroundColor: color,
                borderRadius: 2,
                transform: [{ rotateZ: `${angle}rad` }],
              }}
            />
          );
        })}
      {width > 0 &&
        points.map((point, index) => (
          <View
            key={`pt-${index}`}
            style={{
              position: "absolute",
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fff",
              borderWidth: 2.5,
              borderColor: color,
            }}
          />
        ))}
    </View>
  );
}
