import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TruckCard } from "@/components/TruckCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "active" | "completed";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trucks, tasks, currentUser, logout } = useApp();
  const [filter, setFilter] = useState<Filter>("active");
  const [refreshing, setRefreshing] = useState(false);

  const filteredTrucks = useMemo(() => {
    if (filter === "all") return trucks;
    return trucks.filter((t) => (filter === "active" ? t.status === "in-service" : t.status === "completed"));
  }, [trucks, filter]);

  const getProgress = (truckId: string) => {
    const tt = tasks.filter((t) => t.truckId === truckId);
    return { done: tt.filter((t) => t.completed).length, total: tt.length };
  };

  const activeTrucks = trucks.filter((t) => t.status === "in-service").length;
  const completedTrucks = trucks.filter((t) => t.status === "completed").length;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const isMechanic = currentUser?.role === "mechanic";
  const isManager = currentUser?.role === "manager";

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTrucks}
        keyExtractor={(t) => t.id}
        scrollEnabled={!!filteredTrucks.length}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.topBar,
                { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) },
              ]}
            >
              <View>
                <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                  {isManager ? "Manager Dashboard" : "Mechanic Portal"}
                </Text>
                <Text style={[styles.userName, { color: colors.foreground }]}>
                  {currentUser?.name}
                </Text>
              </View>
              <View style={styles.topActions}>
                {isMechanic && (
                  <TouchableOpacity
                    onPress={() => router.push("/checkin")}
                    style={[styles.iconBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    logout();
                    router.replace("/login");
                  }}
                  style={[styles.iconBtn, { backgroundColor: colors.muted }]}
                  activeOpacity={0.8}
                >
                  <Feather name="log-out" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{activeTrucks}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>In Service</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.success ?? "#38A169" }]}>{completedTrucks}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.foreground }]}>{trucks.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
              </View>
            </View>

            <View style={styles.filterRow}>
              {(["active", "completed", "all"] as Filter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterBtn,
                    {
                      backgroundColor: filter === f ? colors.primary : colors.muted,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: filter === f ? "#FFFFFF" : colors.mutedForeground },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTrucks.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="truck" size={48} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No trucks here</Text>
                <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                  {filter === "active"
                    ? "No trucks currently in service."
                    : filter === "completed"
                    ? "No completed services yet."
                    : "No trucks have been checked in yet."}
                </Text>
                {isMechanic && filter === "active" && (
                  <TouchableOpacity
                    style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/checkin")}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: "#FFFFFF", fontFamily: "Montserrat_600SemiBold" }}>Check In a Truck</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TruckCard
            truck={item}
            taskProgress={getProgress(item.id)}
            onPress={() => router.push(`/truck/${item.id}`)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {isMechanic && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: insets.bottom + (Platform.OS === "web" ? 50 : 20),
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/checkin");
          }}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {isManager && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: insets.bottom + (Platform.OS === "web" ? 50 : 20),
              backgroundColor: colors.secondary,
            },
          ]}
          onPress={() => router.push("/(tabs)/reports")}
          activeOpacity={0.85}
        >
          <Feather name="bar-chart-2" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Montserrat_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  list: {
    paddingTop: 0,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
