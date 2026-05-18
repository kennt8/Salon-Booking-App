import { StyleSheet, Text, View } from "react-native";

export default function AppHeader({ title, subtitle, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!right && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  left: { flex: 1 },
  right: { alignItems: "flex-end", gap: 8 },
  title: { fontSize: 26, fontWeight: "900", color: "#111" },
  subtitle: { marginTop: 4, color: "#5A5A5A", fontWeight: "700" },
});

