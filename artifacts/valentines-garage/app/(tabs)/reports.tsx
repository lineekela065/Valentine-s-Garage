import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MECHANICS, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ReportTab = "employees" | "vehicles";

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trucks, tasks, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ReportTab>("employees");

  const employeeReports = useMemo(() => {
    return MECHANICS.map((m) => {
      const completedByMe = tasks.filter((t) => t.completed && t.completedBy === m.name);
      const truckIds = [...new Set(completedByMe.map((t) => t.truckId))];
      const notedTasks = completedByMe.filter((t) => t.notes.length > 0);
      return {
        mechanic: m,
        tasksCompleted: completedByMe.length,
        trucksWorkedOn: truckIds.length,
        tasksWithNotes: notedTasks.length,
        recentTasks: completedByMe.slice(-3).reverse(),
      };
    }).sort((a, b) => b.tasksCompleted - a.tasksCompleted);
  }, [tasks]);

  const vehicleReports = useMemo(() => {
    return trucks.map((truck) => {
      const tt = tasks.filter((t) => t.truckId === truck.id);
      const done = tt.filter((t) => t.completed);
      const mechanics = [...new Set(done.filter((t) => t.completedBy).map((t) => t.completedBy!))];
      return {
        truck,
        total: tt.length,
        done: done.length,
        mechanics,
        notedTasks: done.filter((t) => t.notes).length,
      };
    }).sort((a) => (a.truck.status === "in-service" ? -1 : 1));
  }, [trucks, tasks]);

  const isManager = currentUser?.role === "manager";

  if (!isManager) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Managers Only</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Reports are only accessible to Valentine.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Garage performance overview
        </Text>
      </View>

      <View style={[styles.summaryRow]}>
        <View style={[styles.summaryCard, { backgroundColor: colors.secondary }]}>
          <Text style={styles.summaryNum}>{trucks.filter((t) => t.status === "in-service").length}</Text>
          <Text style={styles.summaryLabel}>Active Jobs</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#38A169" }]}>
          <Text style={styles.summaryNum}>{trucks.filter((t) => t.status === "completed").length}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryNum}>{tasks.filter((t) => t.completed).length}</Text>
          <Text style={styles.summaryLabel}>Tasks Done</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["employees", "vehicles"] as ReportTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              { borderBottomColor: activeTab === tab ? colors.primary : "transparent" },
            ]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "employees" ? "By Employee" : "By Vehicle"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "employees" && (
        <View style={styles.section}>
          {employeeReports.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>No activity yet.</Text>
            </View>
          ) : (
            employeeReports.map((r) => (
              <View
                key={r.mechanic.id}
                style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.reportHeader}>
                  <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.avatarText}>{r.mechanic.name[0]}</Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportName, { color: colors.foreground }]}>{r.mechanic.name}</Text>
                    <Text style={[styles.reportRole, { color: colors.mutedForeground }]}>Mechanic</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{r.tasksCompleted} tasks</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <StatItem icon="truck" label="Trucks" value={r.trucksWorkedOn.toString()} colors={colors} />
                  <StatItem icon="file-text" label="With Notes" value={r.tasksWithNotes.toString()} colors={colors} />
                  <StatItem icon="check-square" label="Completed" value={r.tasksCompleted.toString()} colors={colors} />
                </View>

                {r.recentTasks.length > 0 && (
                  <View style={[styles.recentSection, { borderTopColor: colors.border }]}>
                    <Text style={[styles.recentLabel, { color: colors.mutedForeground }]}>RECENT WORK</Text>
                    {r.recentTasks.map((t) => (
                      <View key={t.id} style={styles.recentItem}>
                        <Feather name="check-circle" size={12} color={colors.success ?? "#38A169"} />
                        <Text style={[styles.recentText, { color: colors.foreground }]} numberOfLines={1}>
                          {t.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {activeTab === "vehicles" && (
        <View style={styles.section}>
          {vehicleReports.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>No vehicles checked in yet.</Text>
            </View>
          ) : (
            vehicleReports.map((r) => {
              const pct = r.total > 0 ? r.done / r.total : 0;
              const isComplete = r.truck.status === "completed";
              return (
                <View
                  key={r.truck.id}
                  style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.reportHeader}>
                    <View style={[styles.avatar, { backgroundColor: isComplete ? colors.muted : colors.secondary }]}>
                      <Image
                        source={require("../../assets/images/truck.png")}
                        style={{ width: 34, height: 28 }}
                        resizeMode="contain"
                        tintColor={isComplete ? colors.mutedForeground : "#FFFFFF"}
                      />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={[styles.reportName, { color: colors.foreground }]}>{r.truck.truckNumber}</Text>
                      <Text style={[styles.reportRole, { color: colors.mutedForeground }]}>{r.truck.driverName}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: isComplete ? colors.muted : colors.accent }]}>
                      <Text style={[styles.badgeText, { color: isComplete ? colors.mutedForeground : colors.primary }]}>
                        {isComplete ? "Done" : "Active"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Tasks: {r.done}/{r.total}</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct * 100}%`,
                            backgroundColor: pct === 1 ? "#38A169" : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <StatItem icon="activity" label={r.truck.condition} value="Condition" colors={colors} />
                    <StatItem icon="navigation" label={`${r.truck.kilometers.toLocaleString()} km`} value="Odometer" colors={colors} />
                    <StatItem icon="users" label={r.mechanics.length.toString()} value="Mechanics" colors={colors} />
                  </View>

                  {r.mechanics.length > 0 && (
                    <View style={[styles.recentSection, { borderTopColor: colors.border }]}>
                      <Text style={[styles.recentLabel, { color: colors.mutedForeground }]}>WORKED BY</Text>
                      <Text style={[styles.mechanicList, { color: colors.foreground }]}>{r.mechanics.join(", ")}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

function StatItem({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={statStyles.container}>
      <Text style={[statStyles.value, { color: colors.foreground }]}>{label}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", gap: 2 },
  value: { fontSize: 14, fontFamily: "Montserrat_700Bold" },
  label: { fontSize: 11, fontFamily: "Montserrat_400Regular" },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  scroll: { gap: 0 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Montserrat_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  summaryNum: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#FFFFFF",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
  },
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
  reportCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 15,
    fontFamily: "Montserrat_700Bold",
  },
  reportRole: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  progressSection: { gap: 6 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, fontFamily: "Montserrat_400Regular" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  recentSection: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  recentLabel: {
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 1,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recentText: {
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
  },
  mechanicList: {
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
  },
});
