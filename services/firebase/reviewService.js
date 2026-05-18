import { Alert } from "react-native";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function createReview({
  bookingId,
  serviceId,
  serviceName,
  customerId,
  customerEmail,
  rating,
  comment,
}) {
  const r = Number(rating);
  if (!bookingId || !serviceId || !customerId) throw new Error("Missing fields");
  if (!(r >= 1 && r <= 5)) throw new Error("Rating must be 1-5");

  try {
    await addDoc(collection(db, "reviews"), {
      bookingId,
      serviceId,
      serviceName: serviceName ?? null,
      customerId,
      customerEmail: customerEmail ?? null,
      rating: r,
      comment: comment?.trim() ? comment.trim() : "",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    Alert.alert("Review failed", err?.message ?? "Please try again.");
    throw err;
  }
}

export async function listServiceReviews({ serviceId }) {
  const q = query(collection(db, "reviews"), where("serviceId", "==", serviceId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function hasReviewForBooking({ bookingId, customerId }) {
  const q = query(
    collection(db, "reviews"),
    where("bookingId", "==", bookingId),
    where("customerId", "==", customerId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

