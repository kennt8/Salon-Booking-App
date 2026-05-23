import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii } from "../constants/theme";

function HeaderAction({ icon, label, onPress }) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.white} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export default function HomeHeader({
  greeting,
  name,
  photoUrl,
  onProfilePress,
  onLogoutPress,
  onMyBookingsPress,
  onNotificationsPress,
  myBookingsLabel = "My Bookings",
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, "#FF7AA3"]}
      style={[styles.gradient, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.topRow}>
        <View style={styles.greetingCol}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View style={styles.topRight}>
          {onLogoutPress && (
            <Pressable style={styles.logoutBtn} onPress={onLogoutPress} hitSlop={8}>
              <Ionicons name="log-out-outline" size={22} color={colors.white} />
            </Pressable>
          )}
          <Pressable onPress={onProfilePress}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
            )}
          </Pressable>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <HeaderAction
          icon="calendar-outline"
          label={myBookingsLabel}
          onPress={onMyBookingsPress}
        />
        <HeaderAction
          icon="notifications-outline"
          label="Notifications"
          onPress={onNotificationsPress}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingCol: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    marginTop: 2,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  actionText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
