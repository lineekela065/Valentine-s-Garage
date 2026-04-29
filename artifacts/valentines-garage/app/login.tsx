import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MANAGER, MECHANICS, User, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useApp();
  const [selected, setSelected] = useState<User | null>(null);

  const handleSelect = (user: User) => {
    setSelected(user);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const handleEnter = () => {
    if (!selected) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    login(selected);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.secondary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.iconCircle}
            resizeMode="cover"
          />
          <Text style={styles.appName}>Valentine's Garage</Text>
          <Text style={styles.tagline}>Truck Service Management</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            WHO ARE YOU?
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Management
          </Text>
          <TouchableOpacity
            onPress={() => handleSelect(MANAGER)}
            activeOpacity={0.8}
            style={[
              styles.userRow,
              { borderColor: colors.border, backgroundColor: colors.muted },
              selected?.id === MANAGER.id && {
                borderColor: colors.primary,
                backgroundColor: colors.accent,
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>V</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>Valentine</Text>
              <Text style={[styles.userRole, { color: colors.mutedForeground }]}>Garage Owner · Manager</Text>
            </View>
            {selected?.id === MANAGER.id && (
              <View style={[styles.check, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={13} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mechanics</Text>
          {MECHANICS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => handleSelect(m)}
              activeOpacity={0.8}
              style={[
                styles.userRow,
                { borderColor: colors.border, backgroundColor: colors.muted },
                selected?.id === m.id && {
                  borderColor: colors.primary,
                  backgroundColor: colors.accent,
                },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={styles.avatarText}>{m.name[0]}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{m.name}</Text>
                <Text style={[styles.userRole, { color: colors.mutedForeground }]}>Mechanic</Text>
              </View>
              {selected?.id === m.id && (
                <View style={[styles.check, { backgroundColor: colors.primary }]}>
                  <Feather name="check" size={13} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.enterBtn,
              { backgroundColor: selected ? colors.primary : colors.muted },
            ]}
            onPress={handleEnter}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.enterBtnText,
                { color: selected ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              Enter Garage
            </Text>
            <Feather
              name="arrow-right"
              size={18}
              color={selected ? colors.primaryForeground : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingTop: Platform.OS === "web" ? 80 : 40,
    paddingBottom: 40,
    gap: 24,
  },
  hero: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Montserrat_400Regular",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Montserrat_600SemiBold",
  },
  userRole: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    marginTop: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  enterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
  },
  enterBtnText: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
});
