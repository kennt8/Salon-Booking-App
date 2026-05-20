import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import AppButton from "./AppButton";

/**
 * Shows a preview and buttons to pick an image from library or camera.
 */
export default function ImagePickerField({
  label,
  hint,
  imageUri,
  onPickLibrary,
  onPickCamera,
  loading = false,
}) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {!!hint && <Text style={styles.hint}>{hint}</Text>}

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}

      <View style={styles.row}>
        <AppButton
          title="Choose photo"
          variant="secondary"
          onPress={onPickLibrary}
          loading={loading}
          style={styles.flex1}
        />
        <AppButton
          title="Camera"
          variant="secondary"
          onPress={onPickCamera}
          disabled={loading}
          style={styles.flex1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontWeight: "900", color: "#111", fontSize: 15 },
  hint: { color: "#555", fontWeight: "600" },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: "#EEE",
  },
  placeholder: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  placeholderText: { color: "#888", fontWeight: "700" },
  row: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
});
