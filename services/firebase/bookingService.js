import { Alert } from "react-native";
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";
import { createNotification } from "./notificationService";

const SLOT_MINUTES = 15;
const DEFAULT_RESOURCE_ID = "salon-main";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toSlotStamp(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  return `${y}${m}${d}_${hh}${mm}`;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildSlotIds({ resourceId, startAt, durationMinutes }) {
  const dur = Math.max(1, Number(durationMinutes) || 0);
  const count = Math.ceil(dur / SLOT_MINUTES);
  const ids = [];
  for (let i = 0; i < count; i += 1) {
    const slotTime = addMinutes(startAt, i * SLOT_MINUTES);
    ids.push(`${resourceId}_${toSlotStamp(slotTime)}`);
  }
  return ids;
}

export async function createBooking({
  customerId,
  customerEmail,
  serviceId,
  serviceName,
  durationMinutes,
  price,
  startAt,
  resourceId = DEFAULT_RESOURCE_ID,
}) {
  if (!customerId) throw new Error("Missing customerId");
  if (!serviceId) throw new Error("Missing serviceId");
  if (!(startAt instanceof Date) || Number.isNaN(startAt.getTime())) {
    throw new Error("Invalid start time");
  }

  const slotIds = buildSlotIds({ resourceId, startAt, durationMinutes });
  const bookingRef = doc(collection(db, "bookings"));

  try {
    await runTransaction(db, async (tx) => {
      for (const slotId of slotIds) {
        const slotRef = doc(db, "schedules", slotId);
        const slotSnap = await tx.get(slotRef);
        if (slotSnap.exists()) {
          throw new Error("This time is already booked. Please choose another slot.");
        }
      }

      tx.set(bookingRef, {
        customerId,
        customerEmail: customerEmail ?? null,
        serviceId,
        serviceName,
        durationMinutes,
        price,
        resourceId,
        startAt,
        endAt: addMinutes(startAt, Number(durationMinutes) || 0),
        status: "pending", // pending | confirmed | completed | cancelled
        slotIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (const slotId of slotIds) {
        const slotRef = doc(db, "schedules", slotId);
        tx.set(slotRef, {
          bookingId: bookingRef.id,
          customerId,
          resourceId,
          startAt,
          status: "held",
          createdAt: serverTimestamp(),
        });
      }
    });

    await createNotification({
      toUserId: customerId,
      title: "Booking created",
      body: `Your booking for ${serviceName} is pending.`,
      type: "booking_created",
      data: { serviceId, serviceName },
    });

    return bookingRef.id;
  } catch (err) {
    Alert.alert("Booking failed", err?.message ?? "Please try again.");
    throw err;
  }
}

export function subscribeToMyBookings({ customerId, onChange, onError }) {
  // Intentionally no orderBy here to avoid requiring a composite index.
  // We'll sort on the client instead.
  const q = query(collection(db, "bookings"), where("customerId", "==", customerId));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(items);
    },
    (err) => {
      onError?.(err);
    }
  );
}

export function subscribeToAllBookings({ onChange, onError }) {
  const q = query(collection(db, "bookings"));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(items);
    },
    (err) => onError?.(err)
  );
}

export async function cancelBooking({ bookingId, slotIds = [] }) {
  if (!bookingId) return;
  await runTransaction(db, async (tx) => {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists()) return;

    tx.update(bookingRef, {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });

    const ids = Array.isArray(slotIds) && slotIds.length ? slotIds : bookingSnap.data()?.slotIds ?? [];
    for (const slotId of ids) {
      tx.delete(doc(db, "schedules", slotId));
    }
  });
}

