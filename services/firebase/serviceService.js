import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function listServices() {
  const q = query(collection(db, "services"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function servicesHasAny() {
  const q = query(collection(db, "services"), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function seedSampleServices() {
  const sample = [
    {
      name: "Haircut",
      description: "Classic cut and style",
      durationMinutes: 30,
      price: 15,
      active: true,
    },
    {
      name: "Beard Trim",
      description: "Shape and clean-up",
      durationMinutes: 15,
      price: 8,
      active: true,
    },
    {
      name: "Haircut + Beard",
      description: "Full grooming package",
      durationMinutes: 45,
      price: 20,
      active: true,
    },
  ];

  for (const s of sample) {
    await addDoc(collection(db, "services"), {
      ...s,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

