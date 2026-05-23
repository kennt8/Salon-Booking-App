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
      name: "Haircut & Style",
      description: "Cut, wash, and blow dry",
      durationMinutes: 45,
      price: 350,
      imageUrl:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
      active: true,
    },
    {
      name: "Gel Manicure",
      description: "Long-lasting gel polish",
      durationMinutes: 60,
      price: 400,
      imageUrl:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
      active: true,
    },
    {
      name: "Signature Facial",
      description: "Deep cleanse and hydration",
      durationMinutes: 75,
      price: 800,
      imageUrl:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
      active: true,
    },
    {
      name: "Color & Highlights",
      description: "Full color or partial highlights",
      durationMinutes: 120,
      price: 1500,
      imageUrl:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
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

