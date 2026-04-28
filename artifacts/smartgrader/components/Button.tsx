import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  style,
  fullWidth,
}: Props) {
  const colors = useColors();

  const palette = (() => {
    switch (variant) {
      case "primary":
        return { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary };
      case "secondary":
        return { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary };
      case "outline":
        return { bg: "transparent", fg: colors.primary, border: colors.primary };
      case "ghost":
        return { bg: "transparent", fg: colors.primary, border: "transparent" };
      case "destructive":
        return { bg: colors.destructive, fg: colors.destructiveForeground, border: colors.destructive };
    }
  })();

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const fontSizes: Record<Size, number> = { sm: 14, md: 15, lg: 17 };
  const paddings: Record<Size, number> = { sm: 12, md: 18, lg: 22 };

  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        if (Platform.OS !== "web") Haptics.selectionAsync();
        onPress?.();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === "outline" ? 1.5 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
          borderRadius: 12,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              {
                color: palette.fg,
                fontSize: fontSizes[size],
                fontFamily: "Inter_600SemiBold",
                marginLeft: icon ? 8 : 0,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
