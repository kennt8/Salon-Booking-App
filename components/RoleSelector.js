import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii } from "../constants/theme";

export default function RoleSelector({ role, onChange }) {
  const isCustomer = role === "customer";

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange("customer")}
          style={[styles.option, isCustomer && styles.optionActive]}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={isCustomer ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.optionText, isCustomer && styles.optionTextActive]}>
            Customer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange("staff")}
          style={[styles.option, !isCustomer && styles.optionActive]}
        >
          <Ionicons
            name="cut-outline"
            size={22}
            color={!isCustomer ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.optionText, !isCustomer && styles.optionTextActive]}>
            Staff
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMuted,
  },
  optionTextActive: {
    color: colors.primary,
  },
});
