import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCC4IMnL85F2sEhfFwOJNXrn_tas4Ynbn4",
    authDomain: "salon-booking-app-313bb.firebaseapp.com",
    projectId: "salon-booking-app-313bb",
    storageBucket: "salon-booking-app-313bb.firebasestorage.app",
    messagingSenderId: "370795792398",
    appId: "1:370795792398:web:39e6e1d919575ee743945f"
  };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);