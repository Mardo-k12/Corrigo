import React from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
};

export function Input({ label, error, hint, style, multiline, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.destructive : colors.border,
            color: colors.foreground,
            minHeight: multiline ? 120 : 48,
            paddingTop: multiline ? 12 : 0,
            textAlignVertical: multiline ? "top" : "center",
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[styles.hint, { color: colors.destructive }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
