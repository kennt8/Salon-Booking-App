import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii } from "../constants/theme";

export default function AuthTextInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showToggle,
  visible,
  onToggleVisibility,
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !visible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
      />
      {showToggle && (
        <Pressable onPress={onToggleVisibility} hitSlop={10}>
          <Ionicons
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: radii.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },
});
