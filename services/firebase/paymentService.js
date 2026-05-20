import { Alert } from "react-native";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import { createNotification } from "./notificationService";

export async function markBookingPaidCash({ bookingId, staffId, staffEmail }) {
  if (!bookingId) throw new Error("Missing bookingId");
  if (!staffId) throw new Error("Missing staffId");

  const bookingRef = doc(db, "bookings", bookingId);
  const paymentRef = doc(collection(db, "payments"));

  try {
    let bookingForNotification = null;

    await runTransaction(db, async (tx) => {
      const bookingSnap = await tx.get(bookingRef);
      if (!bookingSnap.exists()) throw new Error("Booking not found.");

      const booking = bookingSnap.data();
      bookingForNotification = booking;

      if (booking.paymentStatus === "paid") {
        throw new Error("This booking is already marked as paid.");
      }

      tx.set(paymentRef, {
        bookingId,
        customerId: booking.customerId ?? null,
        amount: booking.price ?? null,
        currency: "PHP",
        method: "cash",
        status: "paid",
        proofUrl: booking.paymentProofUrl ?? null,
        markedBy: staffId,
        markedByEmail: staffEmail ?? null,
        markedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      tx.update(bookingRef, {
        paymentStatus: "paid",
        paymentMethod: "cash",
        paymentId: paymentRef.id,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await createNotification({
      toUserId: bookingForNotification?.customerId,
      title: "Payment received",
      body: `Cash payment marked as PAID for ${bookingForNotification?.serviceName ?? "your booking"}.`,
      type: "payment_paid",
      data: { bookingId, method: "cash" },
    });

    return paymentRef.id;
  } catch (err) {
    Alert.alert("Payment update failed", err?.message ?? "Please try again.");
    throw err;
  }
}

/**
 * Customer uploads proof of payment (receipt/screenshot). Staff can review it
 * before marking the booking as paid.
 */
export async function submitPaymentProof({
  bookingId,
  customerId,
  proofUrl,
}) {
  if (!bookingId) throw new Error("Missing bookingId");
  if (!customerId) throw new Error("Missing customerId");
  if (!proofUrl) throw new Error("Missing proof URL");

  const bookingRef = doc(db, "bookings", bookingId);

  try {
    await runTransaction(db, async (tx) => {
      const bookingSnap = await tx.get(bookingRef);
      if (!bookingSnap.exists()) throw new Error("Booking not found.");

      const booking = bookingSnap.data();
      if (booking.customerId !== customerId) {
        throw new Error("You can only upload proof for your own booking.");
      }
      if (booking.paymentStatus === "paid") {
        throw new Error("This booking is already paid.");
      }

      tx.update(bookingRef, {
        paymentProofUrl: proofUrl,
        paymentProofStatus: "pending",
        paymentProofSubmittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return bookingId;
  } catch (err) {
    Alert.alert("Upload failed", err?.message ?? "Please try again.");
    throw err;
  }
}
