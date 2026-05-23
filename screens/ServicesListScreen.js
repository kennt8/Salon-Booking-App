import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import HomeHeader from "../components/HomeHeader";
import { colors } from "../constants/theme";
import { logout } from "../services/firebase/authService";
import { getUserProfile } from "../services/firebase/userService";
import {
  listServices,
  seedSampleServices,
  servicesHasAny,
} from "../services/firebase/serviceService";
import { formatPeso } from "../utils/formatPrice";
import { getGreeting } from "../utils/timeSlots";

const PLACEHOLDER_IMAGES = {
  "Haircut & Style":
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
  "Gel Manicure":
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
  "Signature Facial":
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
  "Color & Highlights":
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
};

function ServiceCard({ item, onPress }) {
  const imageUri =
    item.imageUrl ?? PLACEHOLDER_IMAGES[item.name] ?? PLACEHOLDER_IMAGES["Haircut & Style"];

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cardPrice}>{formatPeso(item.price)}</Text>
        <AppButton title="Book" variant="yellow" onPress={onPress} style={styles.bookBtn} />
      </View>
    </View>
  );
}

export default function ServicesListScreen({ navigation, userRole, user }) {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);

  const canSeed = useMemo(() => userRole === "staff", [userRole]);
  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Client Name";
  const myBookingsLabel = userRole === "staff" ? "Manage Bookings" : "My Bookings";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listServices();
      setServices(items.filter((s) => s.active !== false));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then(setProfile).catch(() => setProfile(null));
  }, [user?.uid]);

  async function onSeed() {
    if (!canSeed) return;
    setSeeding(true);
    try {
      const hasAny = await servicesHasAny();
      if (!hasAny) {
        await seedSampleServices();
      }
      await refresh();
    } finally {
      setSeeding(false);
    }
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        greeting={getGreeting()}
        name={displayName}
        photoUrl={profile?.photoUrl}
        myBookingsLabel={myBookingsLabel}
        onProfilePress={() => navigation.navigate("Profile")}
        onLogoutPress={logout}
        onMyBookingsPress={() =>
          navigation.navigate(userRole === "staff" ? "StaffBookings" : "MyBookings")
        }
        onNotificationsPress={() => navigation.navigate("Notifications")}
      />

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Our Services</Text>

        {canSeed && services.length === 0 && !loading && (
          <View style={styles.seedWrap}>
            <AppButton
              title="Seed sample services"
              onPress={onSeed}
              loading={seeding}
              variant="secondary"
            />
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={styles.col}>
                <ServiceCard
                  item={item}
                  onPress={() =>
                    navigation.navigate("CreateBooking", { service: item })
                  }
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No services yet</Text>
                <Text style={styles.emptyText}>
                  {canSeed
                    ? "Tap “Seed sample services” to add starter data."
                    : "Ask staff to add salon services."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  seedWrap: { marginBottom: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingBottom: 24, gap: 12 },
  row: { gap: 12 },
  col: { flex: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 110,
    backgroundColor: colors.inputBg,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    minHeight: 40,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 4,
    marginBottom: 10,
  },
  bookBtn: {
    minHeight: 40,
  },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 8, color: colors.textSecondary, textAlign: "center" },
});
