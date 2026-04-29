import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TaskItem } from "@/components/TaskItem";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CONDITION_COLORS: Record<string, string> = {
  excellent: "#38A169",
  good: "#3182CE",
  fair: "#D69E2E",
  poor: "#E53E3E",
};

export default function TruckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trucks, tasks, currentUser, updateTaskCompletion, markTruckComplete } = useApp();
  const [activeTab, setActiveTab] = useState<"tasks" | "info">("tasks");

  const truck = trucks.find((t) => t.id === id);
  const truckTasks = tasks.filter((t) => t.truckId === id);

  const sections = useMemo(() => {
    const byCategory: Record<string, typeof truckTasks> = {};
    truckTasks.forEach((t) => {
      if (!byCategory[t.category]) byCategory[t.category] = [];
      byCategory[t.category].push(t);
    });
    return Object.entries(byCategory).map(([title, data]) => ({ title, data }));
  }, [truckTasks]);

  const done = truckTasks.filter((t) => t.completed).length;
  const total = truckTasks.length;
  const pct = total > 0 ? done / total : 0;

  const isMechanic = currentUser?.role === "mechanic";
  const isComplete = truck?.status === "completed";

  if (!truck) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Truck not found.</Text>
      </View>
    );
  }

  const handleMarkComplete = () => {
    Alert.alert(
      "Mark as Complete",
      "Are you sure all tasks are done and this truck is ready for handover?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "default",
          onPress: () => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            markTruckComplete(truck.id);
            router.back();
          },
        },
      ]
    );
  };

  const conditionColor = CONDITION_COLORS[truck.condition] ?? colors.mutedForeground;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.truckHeader, { backgroundColor: colors.secondary }]}>
          <View style={styles.truckHeaderRow}>
            <View>
              <Text style={styles.truckNum}>{truck.truckNumber}</Text>
              <Text style={styles.driverName}>{truck.driverName}</Text>
            </View>
            <View style={[styles.condBadge, { backgroundColor: conditionColor + "25", borderColor: conditionColor }]}>
              <Text style={[styles.condText, { color: conditionColor }]}>
                {truck.condition.charAt(0).toUpperCase() + truck.condition.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="navigation" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.statText}>{truck.kilometers.toLocaleString()} km</Text>
            </View>
            <View style={styles.stat}>
              <Feather name="user" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.statText}>{truck.checkedInBy}</Text>
            </View>
            <View style={styles.stat}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.statText}>
                {new Date(truck.checkedInAt).toLocaleDateString("en-NA", { day: "numeric", month: "short" })}
              </Text>
            </View>
          </View>

          {!isComplete && (
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Task Progress</Text>
                <Text style={styles.progressCount}>{done}/{total}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: pct === 1 ? "#38A169" : "#E85D04" }]} />
              </View>
            </View>
          )}
          {isComplete && (
            <View style={[styles.completedBanner, { backgroundColor: "#38A16920" }]}>
              <Feather name="check-circle" size={16} color="#38A169" />
              <Text style={[styles.completedText, { color: "#38A169" }]}>Service Completed</Text>
            </View>
          )}
        </View>

        <View style={styles.tabRow}>
          {(["tasks", "info"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                { borderBottomColor: activeTab === tab ? colors.primary : "transparent" },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab === "tasks" ? "Service Tasks" : "Vehicle Info"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "tasks" && (
          <View style={styles.taskList}>
            {sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                  {section.title.toUpperCase()}
                </Text>
                {section.data.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    canEdit={isMechanic && !isComplete}
                    onUpdate={(completed, notes) => updateTaskCompletion(task.id, completed, notes)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        {activeTab === "info" && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow label="Truck / Vehicle #" value={truck.truckNumber} colors={colors} />
            <InfoRow label="Driver" value={truck.driverName} colors={colors} />
            <InfoRow label="Kilometers" value={`${truck.kilometers.toLocaleString()} km`} colors={colors} />
            <InfoRow
              label="Condition at Arrival"
              value={truck.condition.charAt(0).toUpperCase() + truck.condition.slice(1)}
              valueColor={conditionColor}
              colors={colors}
            />
            {truck.conditionNotes ? (
              <InfoRow label="Condition Notes" value={truck.conditionNotes} colors={colors} />
            ) : null}
            <InfoRow label="Checked In By" value={truck.checkedInBy} colors={colors} />
            <InfoRow
              label="Check-in Date"
              value={new Date(truck.checkedInAt).toLocaleString("en-NA")}
              colors={colors}
            />
            <InfoRow label="Status" value={truck.status === "completed" ? "Completed" : "In Service"} colors={colors} />
          </View>
        )}
      </ScrollView>

      {!isComplete && (
        <View
          style={[
            styles.fab,
            {
              bottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
              backgroundColor: pct === 1 ? colors.success : colors.primary,
            },
          ]}
        >
          {currentUser?.role === "mechanic" ? (
            pct === 1 ? (
              <TouchableOpacity
                style={styles.fabInner}
                onPress={handleMarkComplete}
                activeOpacity={0.85}
              >
                <Feather name="check-circle" size={20} color="#fff" />
                <Text style={styles.fabText}>Mark Complete</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.fabInner}>
                <Feather name="tool" size={18} color="#fff" />
                <Text style={styles.fabText}>Tick off tasks above</Text>
              </View>
            )
          ) : (
            <View style={styles.fabInner}>
              <Feather name="eye" size={18} color="#fff" />
              <Text style={styles.fabText}>{done}/{total} tasks done</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: any;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1.5,
    textAlign: "right",
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { gap: 0 },
  truckHeader: {
    padding: 20,
    gap: 14,
  },
  truckHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  truckNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  driverName: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  condBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  condText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  progressSection: {
    gap: 6,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
  },
  progressCount: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  taskList: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoCard: {
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  fab: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
