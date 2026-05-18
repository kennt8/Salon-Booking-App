import { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import { createBooking } from "../services/firebase/bookingService";

export default function CreateBookingScreen({ route, navigation, user }) {
  const service = route?.params?.service;

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setSeconds(0);
    d.setMilliseconds(0);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
    return d;
  });
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const duration = useMemo(() => service?.durationMinutes ?? 30, [service]);

  const friendly = useMemo(() => {
    return date.toLocaleString();
  }, [date]);

  async function onCreate() {
    if (!service?.id) {
      Alert.alert("Missing service", "Please go back and choose a service.");
      return;
    }
    if (!user?.uid) return;

    setSubmitting(true);
    try {
      await createBooking({
        customerId: user.uid,
        customerEmail: user.email,
        serviceId: service.id,
        serviceName: service.name,
        durationMinutes: duration,
        price: service.price ?? null,
        startAt: date,
      });
      Alert.alert("Booking created", "Your booking is now pending.");
      navigation.navigate("MyBookings");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Create booking" subtitle="Pick a time that works for you" />

      <View style={styles.card}>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{service?.name ?? "Unknown"}</Text>
        <Text style={styles.small}>
          Duration: {duration} min • Price: ₱{service?.price ?? "-"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Start time</Text>
        <Text style={styles.value}>{friendly}</Text>

        <View style={styles.row}>
          <AppButton
            title="Pick date"
            variant="secondary"
            onPress={() => setShowDate(true)}
            style={styles.flex1}
          />
          <AppButton
            title="Pick time"
            variant="secondary"
            onPress={() => setShowTime(true)}
            style={styles.flex1}
          />
        </View>

        <Text style={styles.hint}>
          Double-booking is prevented by locking 15-minute slots in Firestore.
        </Text>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Create booking"
          onPress={onCreate}
          loading={submitting}
        />
        <AppButton
          title="Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </View>

      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_, selected) => {
            setShowDate(false);
            if (selected) {
              const next = new Date(date);
              next.setFullYear(selected.getFullYear());
              next.setMonth(selected.getMonth());
              next.setDate(selected.getDate());
              setDate(next);
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={date}
          mode="time"
          minuteInterval={15}
          onChange={(_, selected) => {
            setShowTime(false);
            if (selected) {
              const next = new Date(date);
              next.setHours(selected.getHours());
              next.setMinutes(selected.getMinutes());
              next.setSeconds(0);
              next.setMilliseconds(0);
              setDate(next);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  label: { color: "#555", fontWeight: "800" },
  value: { marginTop: 6, fontSize: 16, fontWeight: "900", color: "#111" },
  small: { marginTop: 6, color: "#555", fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  flex1: { flex: 1 },
  hint: { marginTop: 12, color: "#666", fontWeight: "700" },
  footer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
});

