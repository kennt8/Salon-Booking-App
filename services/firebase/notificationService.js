import { Alert } from "react-native";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function createNotification({
  toUserId,
  title,
  body,
  type,
  data,
}) {
  if (!toUserId) return;

  try {
    await addDoc(collection(db, "logs"), {
      toUserId,
      title: title ?? "",
      body: body ?? "",
      type: type ?? "info",
      data: data ?? null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Notifications should never block the main flow.
    Alert.alert("Notification error", err?.message ?? "Could not create log.");
  }
}

export function subscribeToMyNotifications({ toUserId, onChange, onError }) {
  const q = query(collection(db, "logs"), where("toUserId", "==", toUserId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(items);
    },
    (err) => onError?.(err)
  );
}

