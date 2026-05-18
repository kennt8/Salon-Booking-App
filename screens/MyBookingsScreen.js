import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import {
  cancelBooking,
  subscribeToMyBookings,
} from "../services/firebase/bookingService";
import { hasReviewForBooking } from "../services/firebase/reviewService";

function formatBooking(item) {
  const d = item?.startAt?.toDate ? item.startAt.toDate() : item?.startAt;
  const when = d instanceof Date ? d.toLocaleString() : "Unknown time";
  return { when };
}

function StatusPill({ status }) {
  const label = status ?? "pending";
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export default function MyBookingsScreen({ navigation, user }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [reviewed, setReviewed] = useState({});

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const ad = a?.createdAt?.toDate ? a.createdAt.toDate() : null;
      const bd = b?.createdAt?.toDate ? b.createdAt.toDate() : null;
      const at = ad instanceof Date ? ad.getTime() : 0;
      const bt = bd instanceof Date ? bd.getTime() : 0;
      return bt - at;
    });
    return copy;
  }, [items]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = subscribeToMyBookings({
      customerId: user.uid,
      onChange: (next) => {
        setItems(next);
        setLoading(false);
      },
      onError: (err) => {
        setLoading(false);
        Alert.alert(
          "Could not load bookings",
          err?.message ??
            "Firestore rejected the query. This is usually a rules or index issue."
        );
      },
    });

    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user?.uid) return;
      const nextMap = {};
      for (const b of items) {
        if (b?.id && b?.status === "completed") {
          try {
            nextMap[b.id] = await hasReviewForBooking({
              bookingId: b.id,
              customerId: user.uid,
            });
          } catch {
            nextMap[b.id] = false;
          }
        }
      }
      if (!cancelled) setReviewed(nextMap);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [items, user?.uid]);

  const canCancel = useMemo(
    () => (status) => status === "pending" || status === "confirmed",
    []
  );

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
        title="My bookings"
        subtitle="Track status and payment"
        right={
          <AppButton
            title="Inbox"
            variant="secondary"
            onPress={() => navigation.navigate("Notifications")}
          />
        }
      />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              Go to Services and tap a service to book.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const { when } = formatBooking(item);
          const canReview =
            item.status === "completed" && reviewed[item.id] === false;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.serviceName ?? "Service"}</Text>
                <StatusPill status={item.status} />
              </View>
              <Text style={styles.cardText}>{when}</Text>
              <Text style={styles.cardText}>
                Duration: {item.durationMinutes ?? "-"} min • ₱{item.price ?? "-"}
              </Text>
              <Text style={styles.cardText}>
                Payment: {item.paymentStatus === "paid" ? "PAID" : "UNPAID (cash)"}
              </Text>

              {canCancel(item.status) && (
                <View style={styles.actionRow}>
                  <AppButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() =>
                      cancelBooking({ bookingId: item.id, slotIds: item.slotIds })
                    }
                    style={styles.flex1}
                  />
                </View>
              )}

              {canReview && (
                <View style={styles.actionRow}>
                  <AppButton
                    title="Leave a review"
                    onPress={() => navigation.navigate("LeaveReview", { booking: item })}
                    style={styles.flex1}
                  />
                </View>
              )}
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  cardText: { marginTop: 6, color: "#444", fontWeight: "700" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillText: { fontWeight: "800" },
  actionRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900" },
  emptyText: { marginTop: 8, color: "#444", textAlign: "center" },
});

