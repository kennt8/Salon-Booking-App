import {
  cloudinaryConfig,
  getCloudinaryUploadUrl,
  isCloudinaryConfigured,
} from "../../config/cloudinary";
import { guessMimeType } from "../../utils/pickImage";

export const UPLOAD_FOLDERS = {
  profiles: "salon-profiles",
  payments: "salon-payments",
};

function assertConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add EXPO_PUBLIC_CLOUDINARY_* values to your .env file (see docs/CLOUDINARY_SETUP.md)."
    );
  }
}

/**
 * Upload a local image URI to Cloudinary using an unsigned upload preset.
 * Returns the secure HTTPS URL stored in Cloudinary.
 */
export async function uploadImageToCloudinary({
  localUri,
  uploadPreset,
  folder,
  publicId,
}) {
  assertConfigured();

  if (!localUri) throw new Error("No image selected.");
  if (!uploadPreset) throw new Error("Missing Cloudinary upload preset.");

  const formData = new FormData();
  const mimeType = guessMimeType(localUri);
  const fileName = localUri.split("/").pop() || "upload.jpg";

  formData.append("file", {
    uri: localUri,
    type: mimeType,
    name: fileName,
  });
  formData.append("upload_preset", uploadPreset);

  if (folder) formData.append("folder", folder);
  if (publicId) formData.append("public_id", publicId);

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      `Cloudinary upload failed (${response.status}).`;
    throw new Error(message);
  }

  if (!payload.secure_url) {
    throw new Error("Cloudinary did not return a secure_url.");
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id ?? null,
    width: payload.width ?? null,
    height: payload.height ?? null,
  };
}

export async function uploadProfilePhoto({ localUri, userId }) {
  return uploadImageToCloudinary({
    localUri,
    uploadPreset: cloudinaryConfig.uploadPresetProfiles,
    folder: UPLOAD_FOLDERS.profiles,
    publicId: userId ? `user_${userId}` : undefined,
  });
}

export async function uploadPaymentProof({ localUri, bookingId }) {
  return uploadImageToCloudinary({
    localUri,
    uploadPreset: cloudinaryConfig.uploadPresetPayments,
    folder: UPLOAD_FOLDERS.payments,
    publicId: bookingId ? `booking_${bookingId}_proof` : undefined,
  });
}
