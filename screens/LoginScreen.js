import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { loginWithEmail } from "../services/firebase/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await loginWithEmail({ email: email.trim(), password });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salon Booking</Text>
      <Text style={styles.subtitle}>Login</Text>

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
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
        onPress={onLogin}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>No account? Create one</Text>
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
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 16, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 14, color: "#111", fontWeight: "600" },
});

