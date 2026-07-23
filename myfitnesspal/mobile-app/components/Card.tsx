import { View, ViewProps } from "react-native";
import classNames from "classnames";

export function Card({ className, style, ...props }: ViewProps) {
  return (
    <View
      className={classNames("bg-white rounded-2xl p-4", className)}
      style={[
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    />
  );
}
