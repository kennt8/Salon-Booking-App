import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, radii } from "../constants/theme";

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === "secondary"
      ? styles.secondary
      : variant === "yellow"
        ? styles.yellow
        : variant === "ghost"
          ? styles.ghost
          : styles.primary;

  const textStyle =
    variant === "yellow"
      ? styles.yellowText
      : variant === "primary"
        ? styles.primaryText
        : styles.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, variantStyle, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.text}
        />
      ) : (
        <Text style={[styles.textBase, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.primary },
  yellow: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.6 },
  textBase: { fontWeight: "800", fontSize: 16 },
  primaryText: { color: colors.white },
  yellowText: { color: colors.text },
  secondaryText: { color: colors.text },
});
