import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import { createReview } from "../services/firebase/reviewService";

export default function LeaveReviewScreen({ route, navigation, user }) {
  const booking = route?.params?.booking;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  async function onSubmit() {
    if (!booking?.id) {
      Alert.alert("Missing booking", "Please go back and select a booking.");
      return;
    }

    setSaving(true);
    try {
      await createReview({
        bookingId: booking.id,
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        customerId: user.uid,
        customerEmail: user.email,
        rating,
        comment,
      });
      Alert.alert("Thank you!", "Your review has been submitted.");
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Leave a review"
        subtitle={booking?.serviceName ?? "Service"}
      />

      <Text style={styles.label}>Rating</Text>
      <View style={[styles.row, { paddingHorizontal: 16 }]}>
        {stars.map((s) => (
          <Pressable
            key={s}
            onPress={() => setRating(s)}
            style={[styles.starBtn, rating === s && styles.starBtnActive]}
          >
            <Text style={[styles.starText, rating === s && styles.starTextActive]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Comment (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Write a short review..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <View style={styles.footer}>
        <AppButton title="Submit review" onPress={onSubmit} loading={saving} />
        <AppButton
          title="Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { marginTop: 18, marginHorizontal: 16, fontWeight: "900", color: "#111" },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  starBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  starBtnActive: { backgroundColor: "#111", borderColor: "#111" },
  starText: { fontWeight: "900", color: "#111" },
  starTextActive: { color: "#fff" },
  input: {
    marginTop: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16 },
});

