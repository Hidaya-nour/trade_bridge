import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import {
  type DeliveryPriority,
  type DeliveryStatus,
  type DriverDelivery,
} from "@/features/driver-deliveries/delivery.types";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const deliveryTabs = [
  "pending",
  "assigned",
  "picked_up",
  "delivered",
  "cancelled",
] as const;

type DeliveryTab = (typeof deliveryTabs)[number];

const matchesTab = (delivery: DriverDelivery, tab: DeliveryTab) => {
  switch (tab) {
    case "pending":
    case "assigned":
    case "delivered":
    case "cancelled":
      return delivery.status === tab;
    case "picked_up":
      return ["picked_up"].includes(delivery.status);
  }
};

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusColors = (status: DeliveryStatus) => {
  switch (status) {
    case "assigned":
      return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
    case "picked_up":
      return { bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe" };
    case "delivered":
      return { bg: "#ecfdf3", text: "#15803d", border: "#bbf7d0" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
    case "failed":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
  }
};

const getPriorityColors = (priority: DeliveryPriority) => {
  switch (priority) {
    case "urgent":
      return { bg: "#fef2f2", text: "#b91c1c" };
    case "fragile":
      return { bg: "#fff7ed", text: "#c2410c" };
    default:
      return { bg: "#f8fafc", text: "#475569" };
  }
};

function DeliveryCard({
  delivery,
  onPress,
}: {
  delivery: DriverDelivery;
  onPress: () => void;
}) {
  const statusColors = getStatusColors(delivery.status);
  const priorityColors = getPriorityColors(delivery.priority);
  const productCount = (delivery.products ?? []).reduce(
    (total, product) => total + product.quantity,
    0,
  );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.orderCode}>{delivery.orderCode}</Text>
          <Text style={styles.routeText}>
            {delivery.supplierName} to {delivery.buyerName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </View>

      <View style={styles.badgeRow}>
        <Text
          style={[
            styles.badge,
            {
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              borderColor: statusColors.border,
            },
          ]}
        >
          {formatStatus(delivery.status)}
        </Text>
        <Text
          style={[
            styles.badge,
            {
              backgroundColor: priorityColors.bg,
              color: priorityColors.text,
              borderColor: "transparent",
            },
          ]}
        >
          {delivery.priority.toUpperCase()}
        </Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Destination</Text>
          <Text style={styles.infoValue}>{delivery.destination}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {delivery.status === "delivered" ? "Delivered" : "ETA"}
          </Text>
          <Text style={styles.infoValue}>
            {delivery.status === "delivered"
              ? delivery.deliveredAt
              : `${delivery.etaMinutes} min`}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Window</Text>
          <Text style={styles.infoValue}>{delivery.scheduledWindow}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Load</Text>
          <Text style={styles.infoValue}>{productCount} units</Text>
        </View>
      </View>

      <View style={styles.progressMetaRow}>
        <Text style={styles.progressText}>{delivery.routeProgress}% route complete</Text>
        <Text style={styles.progressText}>{delivery.distanceKm} km</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${delivery.routeProgress}%` }]}
        />
      </View>
    </Pressable>
  );
}

function TabBar({
  tabs,
  activeTab,
  onTabPress,
}: {
  tabs: readonly DeliveryTab[];
  activeTab: DeliveryTab;
  onTabPress: (tab: DeliveryTab) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.replace("_", " ").toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function DriverDeliveriesScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DeliveryTab>("pending");
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const tabs = deliveryTabs;
  const tabLabels: Record<DeliveryTab, string> = {
    pending: "Pending",
    assigned: "Assigned",
    picked_up: "Picked Up",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  useEffect(() => {
    const loadDeliveries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await deliveryService.getMyDeliveries();
        setDeliveries(rows);

        const defaultTab = tabs.find((tab) =>
          rows.some((delivery) => matchesTab(delivery, tab)),
        );
        setActiveTab(defaultTab ?? "pending");
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            "Failed to load deliveries from the backend.",
        );
        setDeliveries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = deliveries;

    if (query) {
      filtered = filtered.filter((delivery) =>
        [
          delivery.orderCode,
          delivery.supplierName,
          delivery.buyerName,
          delivery.destination,
        ].some((value) => value.toLowerCase().includes(query)),
      );
    }

    return filtered.filter((delivery) => matchesTab(delivery, activeTab));
  }, [activeTab, deliveries, searchQuery]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tabs.forEach((tab) => {
      counts[tab] = deliveries.filter((delivery) => matchesTab(delivery, tab)).length;
    });
    return counts;
  }, [deliveries]);

  const nextDelivery = deliveries.filter(
    (delivery) =>
      delivery.status !== "delivered" &&
      delivery.status !== "failed" &&
      delivery.status !== "cancelled",
  )[0];

  return (
    <ScreenWrapper title="Deliveries" subtitle="Driver delivery workspace">
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroTitle}>Deliveries Overview</Text>
            <Text style={styles.heroSubtitle}>
              Review deliveries by status and open any card for details.
            </Text>
          </View>
          <View style={styles.heroStatsRow}>
            {tabs.map((tab) => (
              <View key={tab} style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>{tabCounts[tab]}</Text>
                <Text style={styles.heroStatLabel}>{tabLabels[tab]}</Text>
              </View>
            ))}
          </View>
          {nextDelivery ? (
            <View style={styles.nextStopCard}>
              <Text style={styles.nextStopLabel}>Next priority stop</Text>
              <Text style={styles.nextStopOrder}>{nextDelivery.orderCode}</Text>
              <Text style={styles.nextStopRoute}>
                {nextDelivery.destination} • {nextDelivery.etaMinutes} min away
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.searchCard}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order, customer, supplier, or destination"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TabBar tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {tabLabels[activeTab]}
            </Text>
            <Text style={styles.sectionCount}>{filteredDeliveries.length}</Text>
          </View>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading deliveries</Text>
              <Text style={styles.emptySubtitle}>
                Fetching your assigned deliveries from the backend.
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Could not load deliveries</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
            </View>
          ) : filteredDeliveries.length ? (
            filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onPress={() => router.push(`/driver/deliveries/${delivery.id}` as never)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No {tabLabels[activeTab].toLowerCase()}
              </Text>
              <Text style={styles.emptySubtitle}>
                Deliveries with this status will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  heroTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  heroStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroStatChip: {
    width: "31%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  heroStatValue: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
  },
  heroStatLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  nextStopCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  nextStopLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
    textTransform: "uppercase",
  },
  nextStopOrder: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  nextStopRoute: {
    marginTop: 4,
    fontSize: 13,
    color: "#334155",
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  tab: {
    width: "50%",
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#0f172a",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  activeTabText: {
    color: "#ffffff",
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCount: {
    minWidth: 30,
    textAlign: "center",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  routeText: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoItem: {
    width: "47%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  infoValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#dbeafe",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 18,
  },
});
