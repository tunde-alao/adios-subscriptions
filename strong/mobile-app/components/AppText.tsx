import { Text, TextProps } from "react-native";
import classNames from "classnames";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  fontWeight?: "regular" | "bold";
}

export function AppText({
  children,
  className,
  fontWeight = "regular",
  ...props
}: AppTextProps) {
  return (
    <Text
      className={classNames(
        {
          "font-din-rounded-regular": fontWeight === "regular",
          "font-din-rounded-bold": fontWeight === "bold",
        },
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
