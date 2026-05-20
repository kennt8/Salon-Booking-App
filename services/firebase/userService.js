import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateUserPhotoUrl({ uid, photoUrl }) {
  if (!uid) throw new Error("Missing user id.");
  if (!photoUrl) throw new Error("Missing photo URL.");

  await updateDoc(doc(db, "users", uid), {
    photoUrl,
    photoUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
