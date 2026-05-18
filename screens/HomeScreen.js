import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logout } from "../services/firebase/authService";

export default function HomeScreen({ user, role }) {
  const roleLabel = useMemo(() => {
    return role === "staff" ? "Staff" : "Customer";
  }, [role]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You’re signed in</Text>
      <Text style={styles.text}>Email: {user?.email ?? "Unknown"}</Text>
      <Text style={styles.text}>Role: {roleLabel}</Text>

      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 6, color: "#333" },
  button: {
    marginTop: 18,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

