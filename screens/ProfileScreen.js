import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import ImagePickerField from "../components/ImagePickerField";
import { isCloudinaryConfigured } from "../config/cloudinary";
import { logout } from "../services/firebase/authService";
import { uploadProfilePhoto } from "../services/cloudinary/uploadService";
import { getUserProfile, updateUserPhotoUrl } from "../services/firebase/userService";
import { pickImageFromLibrary, takePhotoWithCamera } from "../utils/pickImage";

export default function ProfileScreen({ user }) {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const configured = isCloudinaryConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.uid) return;
      setLoadingProfile(true);
      try {
        const profile = await getUserProfile(user.uid);
        if (!cancelled) setPhotoUrl(profile?.photoUrl ?? null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  async function onPick(getAsset) {
    if (!configured) {
      Alert.alert(
        "Cloudinary not configured",
        "Add your Cloudinary keys to .env (see docs/CLOUDINARY_SETUP.md), then restart Expo."
      );
      return;
    }

    const asset = await getAsset();
    if (!asset?.uri) return;
    setLocalPreview(asset.uri);
  }

  async function onSave() {
    if (!user?.uid) return;
    if (!localPreview) {
      Alert.alert("No photo", "Choose or take a photo first.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadProfilePhoto({
        localUri: localPreview,
        userId: user.uid,
      });
      await updateUserPhotoUrl({ uid: user.uid, photoUrl: url });
      setPhotoUrl(url);
      setLocalPreview(null);
      Alert.alert("Saved", "Your profile photo was updated.");
    } catch (err) {
      Alert.alert("Upload failed", err?.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const displayUri = localPreview ?? photoUrl;

  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Profile"
        subtitle={user?.email ?? ""}
      />

      <View style={styles.card}>
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>
              {(user?.email?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
        )}

        {!configured && (
          <Text style={styles.warning}>
            Cloudinary env vars are missing. Uploads are disabled until you configure
            .env (see docs/CLOUDINARY_SETUP.md).
          </Text>
        )}

        <ImagePickerField
          label="Profile photo"
          hint="JPEG or PNG. Shown on your account after you save."
          imageUri={localPreview}
          onPickLibrary={() => onPick(pickImageFromLibrary)}
          onPickCamera={() => onPick(takePhotoWithCamera)}
          loading={uploading}
        />

        <AppButton
          title="Save profile photo"
          onPress={onSave}
          loading={uploading}
          disabled={!localPreview || !configured}
          style={{ marginTop: 12 }}
        />
      </View>

      <AppButton
        title="Log Out"
        variant="secondary"
        onPress={logout}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
    gap: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    backgroundColor: "#EEE",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 36, fontWeight: "900" },
  warning: {
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 10,
    fontWeight: "700",
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
});
