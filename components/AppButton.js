import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export default function AppButton({
  title,
  onPress,
  variant = "primary", // primary | secondary | ghost
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading;
  const v =
    variant === "secondary"
      ? styles.secondary
      : variant === "ghost"
        ? styles.ghost
        : styles.primary;

  const textStyle =
    variant === "primary" ? styles.primaryText : styles.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, v, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#111"} />
      ) : (
        <Text style={[styles.textBase, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primary: { backgroundColor: "#111" },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.6 },
  textBase: { fontWeight: "800", letterSpacing: 0.2 },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#111" },
});

