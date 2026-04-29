import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ServiceTask } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  task: ServiceTask;
  canEdit: boolean;
  onUpdate: (completed: boolean, notes: string) => void;
}

export function TaskItem({ task, canEdit, onUpdate }: Props) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState(task.notes);
  const [completed, setCompleted] = useState(task.completed);

  const handleToggle = () => {
    if (!canEdit) return;
    const next = !completed;
    setCompleted(next);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onUpdate(next, notes);
  };

  const handleSaveNotes = () => {
    onUpdate(completed, notes);
    setModalVisible(false);
  };

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.border },
          task.completed && { backgroundColor: colors.muted },
        ]}
      >
        <TouchableOpacity
          onPress={handleToggle}
          disabled={!canEdit}
          activeOpacity={0.7}
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? colors.success : colors.border,
              backgroundColor: task.completed ? colors.success : "transparent",
            },
          ]}
        >
          {task.completed && <Feather name="check" size={13} color="#FFFFFF" />}
        </TouchableOpacity>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: task.completed ? colors.mutedForeground : colors.foreground },
              task.completed && styles.completed,
            ]}
          >
            {task.title}
          </Text>
          {task.completedBy && (
            <Text style={[styles.completedBy, { color: colors.mutedForeground }]}>
              {task.completedBy} · {new Date(task.completedAt!).toLocaleTimeString("en-NA", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
          {task.notes.length > 0 && (
            <Text style={[styles.notePreview, { color: colors.primary }]} numberOfLines={1}>
              {task.notes}
            </Text>
          )}
        </View>

        {canEdit && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[styles.noteBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={13} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Task Notes</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sheetTaskTitle, { color: colors.foreground }]}>{task.title}</Text>
            <TextInput
              style={[
                styles.notesInput,
                { color: colors.foreground, backgroundColor: colors.input, borderColor: colors.border },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this task..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveNotes}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
  },
  completed: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  completedBy: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
  },
  notePreview: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
    fontStyle: "italic",
  },
  noteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
  },
  sheetTaskTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    minHeight: 120,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Montserrat_600SemiBold",
  },
});
