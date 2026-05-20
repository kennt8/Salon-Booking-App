import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

async function ensureLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission needed",
      "Allow photo library access to choose an image."
    );
    return false;
  }
  return true;
}

async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission needed", "Allow camera access to take a photo.");
    return false;
  }
  return true;
}

/**
 * Opens the photo library and returns a local file URI, or null if cancelled.
 */
export async function pickImageFromLibrary() {
  const ok = await ensureLibraryPermission();
  if (!ok) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0];
}

/**
 * Opens the camera and returns a local file asset, or null if cancelled.
 */
export async function takePhotoWithCamera() {
  const ok = await ensureCameraPermission();
  if (!ok) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0];
}

export function guessMimeType(uri) {
  const lower = (uri ?? "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
    return Platform.OS === "ios" ? "image/jpeg" : "image/jpeg";
  }
  return "image/jpeg";
}
