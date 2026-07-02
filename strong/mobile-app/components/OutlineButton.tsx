import { useState } from "react";
import { Pressable, View } from "react-native";
import classNames from "classnames";
import { colors } from "@/lib/constants";

interface OutlineButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  /** Tailwind classes applied to the outer pressable wrapper. */
  className?: string;
  /** Tailwind classes applied to the inner content surface. Use for padding overrides. */
  contentClassName?: string;
  /** Override the shadow color. Defaults to the project's `low-shadow` gray. */
  shadowColor?: string;
}

const SHADOW_HEIGHT = 2;

/**
 * Outline button using the same layered shadow pattern as `TodaysGoalCard` /
 * `Token`: a shadow rectangle sits below the surface, and on press the
 * surface slides down to cover the shadow for a tactile 3D click.
 *
 * Shape (rounded-2xl) matches `AppButton` so they can be used together.
 */
export function OutlineButton({
  onPress,
  disabled = false,
  children,
  className,
  contentClassName,
  shadowColor = colors["low-shadow"],
}: OutlineButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={className}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ paddingBottom: SHADOW_HEIGHT }}>
        <View
          className="absolute rounded-2xl"
          style={{
            top: SHADOW_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: shadowColor,
          }}
        />
        <View
          style={{
            transform: [{ translateY: pressed ? SHADOW_HEIGHT : 0 }],
          }}
          className={classNames(
            "rounded-2xl border border-gray-200 bg-white px-4 py-3",
            contentClassName
          )}
        >
          {children}
        </View>
      </View>
    </Pressable>
  );
}
