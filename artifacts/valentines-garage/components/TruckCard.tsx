import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TruckCheckIn } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  truck: TruckCheckIn;
  taskProgress: { done: number; total: number };
  onPress: () => void;
}

const CONDITION_COLORS: Record<TruckCheckIn["condition"], string> = {
  excellent: "#38A169",
  good: "#3182CE",
  fair: "#D69E2E",
  poor: "#E53E3E",
};

const CONDITION_LABELS: Record<TruckCheckIn["condition"], string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export function TruckCard({ truck, taskProgress, onPress }: Props) {
  const colors = useColors();
  const progressPct = taskProgress.total > 0 ? taskProgress.done / taskProgress.total : 0;
  const conditionColor = CONDITION_COLORS[truck.condition];
  const isComplete = truck.status === "completed";

  const date = new Date(truck.checkedInAt);
  const dateStr = date.toLocaleDateString("en-NA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.truckBadge, { backgroundColor: isComplete ? colors.muted : colors.secondary }]}>
          <Image
            source={require("../assets/images/truck.png")}
            style={styles.truckIcon}
            tintColor={isComplete ? colors.mutedForeground : "#FFFFFF"}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.truckNumber, { color: colors.foreground }]}>
            {truck.truckNumber}
          </Text>
          <Text style={[styles.driverName, { color: colors.mutedForeground }]}>
            {truck.driverName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isComplete ? colors.muted : colors.accent }]}>
          <Text style={[styles.statusText, { color: isComplete ? colors.mutedForeground : colors.primary }]}>
            {isComplete ? "Done" : "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Feather name="activity" size={13} color={conditionColor} />
          <Text style={[styles.metaText, { color: conditionColor }]}>
            {CONDITION_LABELS[truck.condition]}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="navigation" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {truck.kilometers.toLocaleString()} km
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
      </View>

      {!isComplete && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Tasks</Text>
            <Text style={[styles.progressCount, { color: colors.primary }]}>
              {taskProgress.done}/{taskProgress.total}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: progressPct === 1 ? colors.success : colors.primary,
                  width: `${progressPct * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Checked in by {truck.checkedInBy}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  truckBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  truckIcon: {
    width: 38,
    height: 32,
    resizeMode: "contain",
  },
  headerText: {
    flex: 1,
  },
  truckNumber: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  driverName: {
    fontSize: 13,
    fontFamily: "Montserrat_400Regular",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
  progressCount: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
});
