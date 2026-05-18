import { doc, getDoc } from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

