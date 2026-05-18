import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import { subscribeToAllBookings } from "../services/firebase/bookingService";
import { markBookingPaidCash } from "../services/firebase/paymentService";
import { createNotification } from "../services/firebase/notificationService";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function BookingCard({ item, onMarkPaid, onSetStatus }) {
  const start = toDate(item.startAt);
  const when = start ? start.toLocaleString() : "Unknown time";
  const isPaid = item.paymentStatus === "paid";

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.title}>{item.serviceName ?? "Service"}</Text>
        <Text style={styles.pill}>{item.status ?? "pending"}</Text>
      </View>

      <Text style={styles.text}>When: {when}</Text>
      <Text style={styles.text}>Customer: {item.customerEmail ?? item.customerId}</Text>
      <Text style={styles.text}>
        Amount: ₱{item.price ?? "-"} • Payment: {isPaid ? "PAID" : "UNPAID"}
      </Text>

      {!isPaid && (
        <View style={{ marginTop: 12 }}>
          <AppButton title="Mark paid (cash)" onPress={onMarkPaid} />
        </View>
      )}

      <View style={styles.actionsRow}>
        <AppButton
          title="Confirm"
          variant="secondary"
          onPress={() => onSetStatus("confirmed")}
          style={styles.flex1}
        />
        <AppButton
          title="Complete"
          variant="secondary"
          onPress={() => onSetStatus("completed")}
          style={styles.flex1}
        />
        <AppButton
          title="Cancel"
          variant="secondary"
          onPress={() => onSetStatus("cancelled")}
          style={styles.flex1}
        />
      </View>
    </View>
  );
}

export default function StaffBookingsScreen({ user }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [markingId, setMarkingId] = useState(null);

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
    const unsub = subscribeToAllBookings({
      onChange: (next) => {
        setItems(next);
        setLoading(false);
      },
      onError: (err) => {
        setLoading(false);
        Alert.alert("Could not load bookings", err?.message ?? "Please try again.");
      },
    });
    return unsub;
  }, []);

  async function onMarkPaid(item) {
    if (!user?.uid) return;
    if (!item?.id) return;

    setMarkingId(item.id);
    try {
      await markBookingPaidCash({
        bookingId: item.id,
        staffId: user.uid,
        staffEmail: user.email,
      });
      Alert.alert("Marked as paid", "Payment recorded as cash.");
    } finally {
      setMarkingId(null);
    }
  }

  async function setStatus(item, status) {
    if (!user?.uid) return;
    if (!item?.id) return;

    try {
      await runTransaction(db, async (tx) => {
        tx.update(doc(db, "bookings", item.id), {
          status,
          updatedAt: serverTimestamp(),
        });
      });

      await createNotification({
        toUserId: item.customerId,
        title: "Booking updated",
        body: `Your booking for ${item.serviceName ?? "a service"} is now ${status}.`,
        type: "booking_status",
        data: { bookingId: item.id, status },
      });
    } catch (err) {
      Alert.alert("Update failed", err?.message ?? "Please try again.");
    }
  }

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
        title="Manage bookings"
        subtitle="Update status and cash payments"
      />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              Once customers create bookings, they will appear here in real time.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={markingId === item.id ? styles.disabled : null}>
            <BookingCard
              item={item}
              onMarkPaid={() => onMarkPaid(item)}
              onSetStatus={(status) => setStatus(item, status)}
            />
          </View>
        )}
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
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: "900" },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    fontWeight: "800",
  },
  text: { marginTop: 6, color: "#333" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  flex1: { flex: 1 },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900" },
  emptyText: { marginTop: 8, color: "#444", textAlign: "center" },
  disabled: { opacity: 0.7 },
});

