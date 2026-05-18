import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export async function registerWithEmail({
  email,
  password,
  role = "customer",
}) {
  const normalizedRole = role === "staff" ? "staff" : "customer";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(
      doc(db, "users", cred.user.uid),
      {
        uid: cred.user.uid,
        email: cred.user.email,
        role: normalizedRole,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return cred.user;
  } catch (err) {
    Alert.alert("Registration failed", err?.message ?? "Please try again.");
    throw err;
  }
}

export async function loginWithEmail({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(
        userRef,
        {
          uid: cred.user.uid,
          email: cred.user.email,
          role: "customer",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return cred.user;
  } catch (err) {
    Alert.alert("Login failed", err?.message ?? "Please try again.");
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
}

