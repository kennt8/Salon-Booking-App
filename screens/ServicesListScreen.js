import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppHeader from "../components/AppHeader";
import { logout } from "../services/firebase/authService";
import {
  listServices,
  seedSampleServices,
  servicesHasAny,
} from "../services/firebase/serviceService";

function ServiceCard({ item, onPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{item.durationMinutes ?? "-"} min</Text>
        <Text style={styles.meta}>₱{item.price ?? "-"}</Text>
      </View>
      <View style={styles.cardActions}>
        <AppButton title="Book" onPress={onPress} style={styles.cardBtn} />
      </View>
    </View>
  );
}

export default function ServicesListScreen({ navigation, userRole }) {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [services, setServices] = useState([]);

  const canSeed = useMemo(() => userRole === "staff", [userRole]);

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
      <AppHeader
        title="Services"
        subtitle="Browse and book in seconds"
        right={
          <AppButton title="Logout" variant="secondary" onPress={logout} />
        }
      />

      <View style={styles.topActions}>
        {userRole === "staff" && (
          <AppButton
            title="Manage"
            variant="secondary"
            onPress={() => navigation.navigate("StaffBookings")}
            style={styles.actionBtn}
          />
        )}
        <AppButton
          title="Inbox"
          variant="secondary"
          onPress={() => navigation.navigate("Notifications")}
          style={styles.actionBtn}
        />
        <AppButton
          title="My bookings"
          variant="secondary"
          onPress={() => navigation.navigate("MyBookings")}
          style={styles.actionBtn}
        />
      </View>

      {canSeed && (
        <View style={styles.seedWrap}>
          <AppButton
            title="Seed sample services"
            onPress={onSeed}
            loading={seeding}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <ServiceCard
                item={item}
                onPress={() =>
                  navigation.navigate("CreateBooking", { service: item })
                }
              />
              <View style={styles.reviewsWrap}>
                <AppButton
                  title="View reviews"
                  variant="secondary"
                  onPress={() => navigation.navigate("ServiceReviews", { service: item })}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No services yet</Text>
              <Text style={styles.emptyText}>
                {canSeed
                  ? "Tap “Seed sample services” to add starter data."
                  : "Ask a staff account to add services (we’ll build service management later)."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topActions: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 8,
  },
  actionBtn: { minWidth: 110 },
  seedWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  cardTitle: { fontSize: 17, fontWeight: "900", color: "#111" },
  cardDesc: { marginTop: 6, color: "#555", fontWeight: "600" },
  metaRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  meta: { fontWeight: "800", color: "#111" },
  cardActions: { marginTop: 14, flexDirection: "row", gap: 10 },
  cardBtn: { flex: 1 },
  reviewsWrap: { marginTop: 10 },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 8, color: "#444", textAlign: "center" },
});

