import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "@/components/AppText";

interface RingSegment {
  pct: number;
  color: string;
}

interface CalorieRingProps {
  calories: number;
  segments: RingSegment[];
  size?: number;
  strokeWidth?: number;
}

export function CalorieRing({
  calories,
  segments,
  size = 150,
  strokeWidth = 14,
}: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePct = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E7E9EC"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment, index) => {
          if (segment.pct <= 0) return null;
          const length = (segment.pct / 100) * circumference;
          const dashOffset = -1 * (cumulativePct / 100) * circumference;
          cumulativePct += segment.pct;

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${length} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppText className="text-gray-900 text-2xl" fontWeight="bold">
          {Math.round(calories)}
        </AppText>
        <AppText className="text-gray-400 text-xs">cal</AppText>
      </View>
    </View>
  );
}
