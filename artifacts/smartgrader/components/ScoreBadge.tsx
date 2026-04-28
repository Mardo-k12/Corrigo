import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { gradeColor, gradeLabel } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

type Props = {
  score: number;
  maxScore: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ScoreBadge({ score, maxScore, showLabel, size = "md" }: Props) {
  const colors = useColors();
  const variant = gradeColor(score, maxScore);
  const palette = (() => {
    switch (variant) {
      case "success":
        return { bg: colors.successSoft, fg: colors.success };
      case "warning":
        return { bg: "#fef3c7", fg: "#b45309" };
      case "destructive":
        return { bg: colors.destructiveSoft, fg: colors.destructive };
    }
  })();

  const fontSize = size === "lg" ? 28 : size === "sm" ? 13 : 18;
  const padV = size === "lg" ? 12 : size === "sm" ? 4 : 8;
  const padH = size === "lg" ? 18 : size === "sm" ? 10 : 12;
  const rounded = Math.round(score * 100) / 100;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: palette.bg, paddingHorizontal: padH, paddingVertical: padV },
      ]}
    >
      <Text style={[styles.score, { color: palette.fg, fontSize }]}>
        {rounded}
        <Text style={[styles.max, { color: palette.fg, fontSize: fontSize * 0.6 }]}>/{maxScore}</Text>
      </Text>
      {showLabel ? (
        <Text style={[styles.label, { color: palette.fg }]}>{gradeLabel(score, maxScore)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  score: {
    fontFamily: "Inter_700Bold",
  },
  max: {
    fontFamily: "Inter_500Medium",
    opacity: 0.7,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
