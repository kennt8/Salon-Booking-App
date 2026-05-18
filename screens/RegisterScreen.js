import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { registerWithEmail } from "../services/firebase/authService";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const roleHelp = useMemo(() => {
    return role === "staff"
      ? "Staff accounts will manage schedules and bookings later."
      : "Customer accounts will book services later.";
  }, [role]);

  async function onRegister() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await registerWithEmail({ email: email.trim(), password, role });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Create account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (6+ characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.sectionTitle}>Role</Text>
      <View style={styles.roleRow}>
        <Pressable
          onPress={() => setRole("customer")}
          style={[
            styles.rolePill,
            role === "customer" && styles.rolePillActive,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              role === "customer" && styles.roleTextActive,
            ]}
          >
            Customer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRole("staff")}
          style={[styles.rolePill, role === "staff" && styles.rolePillActive]}
        >
          <Text
            style={[
              styles.roleText,
              role === "staff" && styles.roleTextActive,
            ]}
          >
            Staff
          </Text>
        </Pressable>
      </View>
      <Text style={styles.help}>{roleHelp}</Text>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
        onPress={onRegister}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to login</Text>
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
  subtitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sectionTitle: { marginTop: 6, fontWeight: "700" },
  roleRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  rolePillActive: { backgroundColor: "#111", borderColor: "#111" },
  roleText: { fontWeight: "700", color: "#111" },
  roleTextActive: { color: "#fff" },
  help: { marginTop: 10, color: "#444" },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 14, color: "#111", fontWeight: "600" },
});

