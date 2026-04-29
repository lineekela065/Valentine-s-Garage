import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TruckCondition, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CONDITIONS: { value: TruckCondition; label: string; icon: string; desc: string }[] = [
  { value: "excellent", label: "Excellent", icon: "star", desc: "No visible issues" },
  { value: "good", label: "Good", icon: "thumbs-up", desc: "Minor wear only" },
  { value: "fair", label: "Fair", icon: "alert-circle", desc: "Needs attention" },
  { value: "poor", label: "Poor", icon: "alert-triangle", desc: "Major issues present" },
];

const CONDITION_COLORS: Record<TruckCondition, string> = {
  excellent: "#38A169",
  good: "#3182CE",
  fair: "#D69E2E",
  poor: "#E53E3E",
};

export default function CheckInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { checkInTruck, currentUser } = useApp();

  const [truckNumber, setTruckNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [condition, setCondition] = useState<TruckCondition | null>(null);
  const [conditionNotes, setConditionNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!truckNumber.trim()) e.truckNumber = "Truck number is required";
    if (!driverName.trim()) e.driverName = "Driver name is required";
    if (!kilometers.trim() || isNaN(Number(kilometers))) e.kilometers = "Valid kilometers required";
    if (!condition) e.condition = "Select vehicle condition";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkInTruck({
      truckNumber: truckNumber.trim().toUpperCase(),
      driverName: driverName.trim(),
      kilometers: Number(kilometers),
      condition: condition!,
      conditionNotes: conditionNotes.trim(),
      checkedInBy: currentUser?.name ?? "Unknown",
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Truck / Vehicle Number</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, borderColor: errors.truckNumber ? colors.destructive : colors.border, color: colors.foreground },
            ]}
            placeholder="e.g. N 12345 NA"
            placeholderTextColor={colors.mutedForeground}
            value={truckNumber}
            onChangeText={setTruckNumber}
            autoCapitalize="characters"
          />
          {errors.truckNumber && <Text style={[styles.error, { color: colors.destructive }]}>{errors.truckNumber}</Text>}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Driver Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, borderColor: errors.driverName ? colors.destructive : colors.border, color: colors.foreground },
            ]}
            placeholder="Full name of the driver"
            placeholderTextColor={colors.mutedForeground}
            value={driverName}
            onChangeText={setDriverName}
          />
          {errors.driverName && <Text style={[styles.error, { color: colors.destructive }]}>{errors.driverName}</Text>}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Odometer Reading (km)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, borderColor: errors.kilometers ? colors.destructive : colors.border, color: colors.foreground },
            ]}
            placeholder="Current kilometers"
            placeholderTextColor={colors.mutedForeground}
            value={kilometers}
            onChangeText={setKilometers}
            keyboardType="numeric"
          />
          {errors.kilometers && <Text style={[styles.error, { color: colors.destructive }]}>{errors.kilometers}</Text>}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Vehicle Condition</Text>
          {errors.condition && <Text style={[styles.error, { color: colors.destructive }]}>{errors.condition}</Text>}
          <View style={styles.conditionGrid}>
            {CONDITIONS.map((c) => {
              const isSelected = condition === c.value;
              const cc = CONDITION_COLORS[c.value];
              return (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => {
                    setCondition(c.value);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.conditionBtn,
                    {
                      borderColor: isSelected ? cc : colors.border,
                      backgroundColor: isSelected ? cc + "18" : colors.card,
                    },
                  ]}
                >
                  <Feather name={c.icon as any} size={18} color={isSelected ? cc : colors.mutedForeground} />
                  <Text style={[styles.conditionLabel, { color: isSelected ? cc : colors.foreground }]}>{c.label}</Text>
                  <Text style={[styles.conditionDesc, { color: colors.mutedForeground }]}>{c.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Condition Notes (Optional)</Text>
          <TextInput
            style={[
              styles.textarea,
              { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder="Describe any visible damage, issues, or other observations..."
            placeholderTextColor={colors.mutedForeground}
            value={conditionNotes}
            onChangeText={setConditionNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Feather name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Check In Truck</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    gap: 8,
  },
  formSection: {
    gap: 6,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  conditionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  conditionBtn: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  conditionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  conditionDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
