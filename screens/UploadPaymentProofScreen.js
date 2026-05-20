import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import ImagePickerField from "../components/ImagePickerField";
import { isCloudinaryConfigured } from "../config/cloudinary";
import { uploadPaymentProof } from "../services/cloudinary/uploadService";
import { submitPaymentProof } from "../services/firebase/paymentService";
import { pickImageFromLibrary, takePhotoWithCamera } from "../utils/pickImage";

export default function UploadPaymentProofScreen({ route, navigation, user }) {
  const booking = route?.params?.booking;
  const [localUri, setLocalUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const configured = isCloudinaryConfigured();

  async function onPick(getAsset) {
    if (!configured) {
      Alert.alert(
        "Cloudinary not configured",
        "Add your Cloudinary keys to .env (see docs/CLOUDINARY_SETUP.md), then restart Expo."
      );
      return;
    }
    const asset = await getAsset();
    if (asset?.uri) setLocalUri(asset.uri);
  }

  async function onSubmit() {
    if (!booking?.id || !user?.uid) return;
    if (!localUri) {
      Alert.alert("No image", "Choose or take a photo of your payment proof.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadPaymentProof({
        localUri,
        bookingId: booking.id,
      });
      await submitPaymentProof({
        bookingId: booking.id,
        customerId: user.uid,
        proofUrl: url,
      });
      Alert.alert(
        "Proof submitted",
        "Staff can review your receipt before marking the booking as paid."
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert("Upload failed", err?.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Payment proof"
        subtitle={booking?.serviceName ?? "Booking"}
      />

      <View style={styles.card}>
        <Text style={styles.text}>
          Upload a screenshot or photo of your payment (GCash, bank transfer, etc.).
          Staff will verify it before marking your booking as paid.
        </Text>

        {!configured && (
          <Text style={styles.warning}>
            Configure Cloudinary in .env first (docs/CLOUDINARY_SETUP.md).
          </Text>
        )}

        <ImagePickerField
          label="Receipt / proof"
          imageUri={localUri}
          onPickLibrary={() => onPick(pickImageFromLibrary)}
          onPickCamera={() => onPick(takePhotoWithCamera)}
          loading={uploading}
        />

        <AppButton
          title="Submit proof"
          onPress={onSubmit}
          loading={uploading}
          disabled={!localUri || !configured}
          style={{ marginTop: 12 }}
        />
        <AppButton
          title="Cancel"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
    gap: 12,
  },
  text: { color: "#444", fontWeight: "600", lineHeight: 22 },
  warning: {
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 10,
    fontWeight: "700",
  },
});
