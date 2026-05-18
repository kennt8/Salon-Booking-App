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
import { listServiceReviews } from "../services/firebase/reviewService";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

export default function ServiceReviewsScreen({ route }) {
  const service = route?.params?.service;
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
    async function run() {
      if (!service?.id) {
        setLoading(false);
        return;
      }
      try {
        const next = await listServiceReviews({ serviceId: service.id });
        setItems(next);
      } catch (err) {
        Alert.alert("Could not load reviews", err?.message ?? "Please try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [service?.id]);

  const avg = useMemo(() => {
    if (!sorted.length) return null;
    const sum = sorted.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Math.round((sum / sorted.length) * 10) / 10;
  }, [sorted]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={`${service?.name ?? "Service"} reviews`}
        subtitle={avg ? `Average: ${avg}/5 (${sorted.length})` : "No reviews yet"}
      />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>
              Reviews appear after a booking is completed.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const d = toDate(item.createdAt);
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rating: {item.rating}/5</Text>
              {!!item.comment && <Text style={styles.cardText}>{item.comment}</Text>}
              <Text style={styles.cardMeta}>
                {item.customerEmail ?? "Customer"} • {d ? d.toLocaleString() : ""}
              </Text>
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
  cardTitle: { fontWeight: "900" },
  cardText: { marginTop: 6, color: "#333" },
  cardMeta: { marginTop: 10, color: "#666", fontSize: 12, fontWeight: "700" },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900" },
  emptyText: { marginTop: 8, color: "#444", textAlign: "center" },
});

