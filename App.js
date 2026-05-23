import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthStack from "./navigation/AppNavigator";
import { auth } from "./services/firebase/firebaseConfig";
import { getUserProfile } from "./services/firebase/userService";
import { onAuthStateChanged } from "firebase/auth";
import MainNavigator from "./navigation/MainNavigator";

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("customer");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        try {
          const profile = await getUserProfile(nextUser.uid);
          setRole(profile?.role === "staff" ? "staff" : "customer");
        } catch {
          setRole("customer");
        }
      } else {
        setRole("customer");
      }

      setInitializing(false);
    });

    return unsub;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainNavigator user={user} role={role} /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
