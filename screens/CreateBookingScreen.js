import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AppButton from "../components/AppButton";
import { colors } from "../constants/theme";
import { createBooking } from "../services/firebase/bookingService";
import { formatPeso } from "../utils/formatPrice";
import {
  BOOKING_TIME_SLOTS,
  applySlotToDate,
  buildDateOptions,
  formatDayLabel,
  formatMonthYear,
  formatSlotLabel,
  isSameDay,
  slotKey,
} from "../utils/timeSlots";

export default function CreateBookingScreen({ route, navigation, user }) {
  const service = route?.params?.service;
  const insets = useSafeAreaInsets();

  const dateOptions = useMemo(() => buildDateOptions(14), []);
  const [selectedDate, setSelectedDate] = useState(() => dateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState(BOOKING_TIME_SLOTS[2]);
  const [submitting, setSubmitting] = useState(false);

  const duration = useMemo(() => service?.durationMinutes ?? 30, [service]);
  const price = service?.price ?? 0;

  const startAt = useMemo(
    () => applySlotToDate(selectedDate, selectedSlot),
    [selectedDate, selectedSlot]
  );

  async function onContinue() {
    if (!service?.id) {
      Alert.alert("Missing service", "Please go back and choose a service.");
      return;
    }
    if (!user?.uid) return;

    setSubmitting(true);
    try {
      const bookingId = await createBooking({
        customerId: user.uid,
        customerEmail: user.email,
        serviceId: service.id,
        serviceName: service.name,
        durationMinutes: duration,
        price: service.price ?? null,
        startAt,
      });
      navigation.navigate("UploadPaymentProof", {
        booking: {
          id: bookingId,
          serviceName: service.name,
          price: service.price,
          startAt,
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.monthLabel}>{formatMonthYear(selectedDate)}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        >
          {dateOptions.map((item) => {
            const selected = isSameDay(item, selectedDate);
            return (
              <Pressable
                key={item.toISOString()}
                style={[styles.dateCard, selected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(item)}
              >
                <Text
                  style={[styles.dateDay, selected && styles.dateTextSelected]}
                >
                  {formatDayLabel(item)}
                </Text>
                <Text
                  style={[styles.dateNum, selected && styles.dateTextSelected]}
                >
                  {item.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Available Time</Text>

        <View style={styles.timeGrid}>
          {BOOKING_TIME_SLOTS.map((slot) => {
            const selected = slotKey(slot) === slotKey(selectedSlot);
            return (
              <Pressable
                key={slotKey(slot)}
                style={[styles.timeSlot, selected && styles.timeSlotSelected]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={styles.timeSlotText}>{formatSlotLabel(slot)}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>{formatPeso(price)}</Text>
        </View>
        <AppButton
          title="Continue to Payment"
          onPress={onContinue}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  headerSpacer: { width: 40 },
  headerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 14,
  },
  dateList: {
    gap: 10,
    paddingBottom: 24,
  },
  dateCard: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.white,
    marginRight: 10,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  dateTextSelected: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 14,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlot: {
    width: "31%",
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  timeSlotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
});
