import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/theme";

export default function GlowUpAuthHeader() {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, "#FF7AA3"]}
      style={styles.gradient}
    >
      <View style={styles.logoBox}>
        <Ionicons name="cut-outline" size={36} color={colors.primary} />
      </View>
      <Text style={styles.brand}>GlowUp</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 56,
    paddingBottom: 56,
    alignItems: "center",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.5,
  },
});
