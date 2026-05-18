import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppHeader from "../components/AppHeader";
import { subscribeToMyNotifications } from "../services/firebase/notificationService";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

export default function NotificationsScreen({ user }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const ad = toDate(a.createdAt);
      const bd = toDate(b.createdAt);
      const at = ad instanceof Date ? ad.getTime() : 0;
      const bt = bd instanceof Date ? bd.getTime() : 0;
      return bt - at;
    });
    return copy;
  }, [items]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToMyNotifications({
      toUserId: user.uid,
      onChange: (next) => {
        setItems(next);
        setLoading(false);
      },
      onError: (err) => {
        setLoading(false);
        Alert.alert("Could not load notifications", err?.message ?? "Please try again.");
      },
    });
    return unsub;
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Inbox" subtitle="Updates from your bookings" />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              When you book or staff marks payment, updates will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const d = toDate(item.createdAt);
          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title ?? "Update"}</Text>
              {!!item.body && <Text style={styles.body}>{item.body}</Text>}
              <Text style={styles.time}>{d ? d.toLocaleString() : ""}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  title: { fontSize: 16, fontWeight: "900" },
  body: { marginTop: 6, color: "#333" },
  time: { marginTop: 10, color: "#666", fontSize: 12, fontWeight: "700" },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900" },
  emptyText: { marginTop: 8, color: "#444", textAlign: "center" },
});

