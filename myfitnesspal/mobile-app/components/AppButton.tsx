import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { ActivityIndicator, Pressable, View } from "react-native";

export enum AppButtonStyle {
  Default = "default",
  Outline = "outline",
}

interface AppButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  text: string;
  className?: string;
  variant?: AppButtonStyle;
}

export function AppButton({
  onPress,
  disabled = false,
  loading = false,
  className,
  text,
  variant = AppButtonStyle.Default,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const isOutline = variant === AppButtonStyle.Outline;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={classNames(className)}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
      })}
    >
      <View
        pointerEvents="none"
        className={classNames("px-4 py-3 rounded-2xl", {
          "bg-primary": !isOutline,
          "border border-primary": isOutline,
        })}
      >
        {loading ? (
          <ActivityIndicator color={isOutline ? "#000" : "white"} />
        ) : (
          <AppText
            className={classNames("text-center font-semibold text-lg", {
              "text-primary-foreground": !isOutline,
              "text-primary": isOutline,
            })}
          >
            {text}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}
