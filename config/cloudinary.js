/**
 * Cloudinary settings for client-side unsigned uploads.
 * Set these in a root `.env` file (see `.env.example`).
 *
 * Never put your API secret in the mobile app.
 */
export const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  uploadPresetProfiles: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PROFILES ?? "",
  uploadPresetPayments:
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PAYMENTS ?? "",
};

export function isCloudinaryConfigured() {
  const { cloudName, uploadPresetProfiles, uploadPresetPayments } =
    cloudinaryConfig;
  return Boolean(cloudName && uploadPresetProfiles && uploadPresetPayments);
}

export function getCloudinaryUploadUrl() {
  const { cloudName } = cloudinaryConfig;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured.");
  }
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}
