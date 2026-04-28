import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate, formatScore } from "@/lib/format";
import type { Student } from "@/lib/types";

type Tab = "students" | "grades" | "details";

export default function CourseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    courses,
    studentsByCourse,
    gradesByCourse,
    addStudent,
    addStudentsBulk,
    deleteStudent,
    gradesByStudent,
    deleteCourse,
  } = useData();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  const [tab, setTab] = useState<Tab>("students");
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showRelevé, setShowRelevé] = useState<Student | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [matricule, setMatricule] = useState("");
  const [bulkText, setBulkText] = useState("");

  if (!course) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Cours introuvable</Text>
      </View>
    );
  }

  const students = studentsByCourse(course.id);
  const grades = gradesByCourse(course.id);

  const stats = useMemo(() => {
    if (grades.length === 0) return { avg: 0, success: 0 };
    const avg = grades.reduce((a, g) => a + (g.score / g.maxScore) * 20, 0) / grades.length;
    const success = grades.filter((g) => g.score / g.maxScore >= 0.5).length;
    return { avg: Math.round(avg * 10) / 10, success: Math.round((success / grades.length) * 100) };
  }, [grades]);

  const onAddStudent = async () => {
    if (!lastName.trim() || !firstName.trim() || !matricule.trim()) return;
    await addStudent({
      courseId: course.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      matricule: matricule.trim(),
    });
    setFirstName("");
    setLastName("");
    setMatricule("");
    setShowAdd(false);
  };

  const onBulkImport = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines
      .map((line) => {
        const parts = line.split(/[,;\t]/).map((p) => p.trim());
        if (parts.length < 3) return null;
        const [last, first, mat] = parts;
        if (!last || !first || !mat) return null;
        return { lastName: last, firstName: first, matricule: mat };
      })
      .filter((x): x is { lastName: string; firstName: string; matricule: string } => Boolean(x));
    if (parsed.length === 0) {
      Alert.alert("Format invalide", "Une ligne par étudiant : Nom, Prénom, Matricule");
      return;
    }
    await addStudentsBulk(course.id, parsed);
    setBulkText("");
    setShowBulk(false);
  };

  const confirmDelete = () => {
    if (Platform.OS === "web") {
      deleteCourse(course.id).then(() => router.back());
      return;
    }
    Alert.alert(
      "Supprimer ce cours ?",
      "Toutes les notes et étudiants associés seront perdus.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteCourse(course.id);
            router.back();
          },
        },
      ],
    );
  };

  const shareReleve = async (student: Student) => {
    const studentGrades = gradesByStudent(student.id);
    const lines = [
      `RELEVÉ DE NOTES - ${course.title}`,
      `Étudiant : ${student.lastName.toUpperCase()} ${student.firstName}`,
      `Matricule : ${student.matricule}`,
      `Semestre : ${course.semester}`,
      `Date : ${formatDate(Date.now())}`,
      "",
      "─".repeat(40),
    ];
    if (studentGrades.length === 0) {
      lines.push("Aucune note enregistrée.");
    } else {
      let totalPercent = 0;
      studentGrades.forEach((g, i) => {
        lines.push(
          `${i + 1}. ${formatDate(g.createdAt)} - ${formatScore(g.score, g.maxScore)} (${Math.round(
            (g.score / g.maxScore) * 20,
          )}/20)`,
        );
        if (g.appreciation) lines.push(`   ${g.appreciation}`);
        totalPercent += g.score / g.maxScore;
      });
      lines.push("─".repeat(40));
      lines.push(
        `MOYENNE : ${((totalPercent / studentGrades.length) * 20).toFixed(1)}/20`,
      );
    }
    try {
      await Share.share({ message: lines.join("\n"), title: `Relevé ${student.lastName}` });
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: course.title,
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Feather name="trash-2" size={20} color={colors.destructive} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        <Card>
          <Text style={[styles.h2, { color: colors.foreground }]}>{course.title}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {course.subject} · {course.semester}
          </Text>
          {course.description ? (
            <Text style={[styles.desc, { color: colors.foreground }]}>{course.description}</Text>
          ) : null}
          <View style={styles.statsRow}>
            <Stat label="Étudiants" value={students.length} colors={colors} />
            <Stat label="Notes" value={grades.length} colors={colors} />
            <Stat label="Moyenne" value={grades.length > 0 ? stats.avg.toFixed(1) : "—"} colors={colors} />
            <Stat label="Réussite" value={grades.length > 0 ? `${stats.success}%` : "—"} colors={colors} />
          </View>
        </Card>

        <View style={[styles.tabs, { backgroundColor: colors.secondary }]}>
          <TabBtn label={`Étudiants (${students.length})`} active={tab === "students"} onPress={() => setTab("students")} colors={colors} />
          <TabBtn label={`Notes (${grades.length})`} active={tab === "grades"} onPress={() => setTab("grades")} colors={colors} />
          <TabBtn label="Détails" active={tab === "details"} onPress={() => setTab("details")} colors={colors} />
        </View>

        {tab === "students" ? (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                title="Ajouter"
                onPress={() => setShowAdd(true)}
                size="sm"
                icon={<Feather name="user-plus" size={14} color="#fff" />}
                style={{ flex: 1 }}
              />
              <Button
                title="Import"
                variant="outline"
                onPress={() => setShowBulk(true)}
                size="sm"
                icon={<Feather name="upload" size={14} color={colors.primary} />}
                style={{ flex: 1 }}
              />
            </View>

            {students.length === 0 ? (
              <EmptyState
                icon="users"
                title="Aucun étudiant"
                description="Ajoutez vos étudiants un par un ou importez-les en masse."
              />
            ) : (
              students.map((s) => {
                const sgrades = gradesByStudent(s.id);
                const avg =
                  sgrades.length > 0
                    ? sgrades.reduce((a, g) => a + (g.score / g.maxScore) * 20, 0) / sgrades.length
                    : 0;
                return (
                  <Card key={s.id} padding={12}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={[styles.studentAvatar, { backgroundColor: colors.primarySoft }]}>
                        <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>
                          {s.firstName[0]}
                          {s.lastName[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.studentName, { color: colors.foreground }]}>
                          {s.lastName.toUpperCase()} {s.firstName}
                        </Text>
                        <Text style={[styles.studentMat, { color: colors.mutedForeground }]}>
                          {s.matricule} · {sgrades.length} note{sgrades.length > 1 ? "s" : ""}
                          {sgrades.length > 0 ? ` · Moy. ${avg.toFixed(1)}/20` : ""}
                        </Text>
                      </View>
                      <Pressable onPress={() => shareReleve(s)} hitSlop={10} style={{ padding: 6 }}>
                        <Feather name="share" size={18} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (Platform.OS === "web") {
                            deleteStudent(s.id);
                            return;
                          }
                          Alert.alert("Supprimer", `Supprimer ${s.firstName} ?`, [
                            { text: "Annuler", style: "cancel" },
                            {
                              text: "Supprimer",
                              style: "destructive",
                              onPress: () => deleteStudent(s.id),
                            },
                          ]);
                        }}
                        hitSlop={10}
                        style={{ padding: 6 }}
                      >
                        <Feather name="x" size={18} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        ) : null}

        {tab === "grades" ? (
          <View style={{ gap: 10 }}>
            {grades.length === 0 ? (
              <EmptyState
                icon="award"
                title="Aucune note"
                description="Lancez une correction depuis l'onglet Scanner."
              />
            ) : (
              grades.map((g) => {
                const student = students.find((s) => s.id === g.studentId);
                return (
                  <Card
                    key={g.id}
                    padding={12}
                    onPress={() =>
                      router.push({ pathname: "/grading/review", params: { gradeId: g.id } })
                    }
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.studentName, { color: colors.foreground }]}>
                          {student
                            ? `${student.lastName.toUpperCase()} ${student.firstName}`
                            : "Anonyme"}
                        </Text>
                        <Text style={[styles.studentMat, { color: colors.mutedForeground }]}>
                          {formatDate(g.createdAt)}
                          {g.validated ? "" : " · À valider"}
                        </Text>
                      </View>
                      <ScoreBadge score={g.score} maxScore={g.maxScore} size="sm" />
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        ) : null}

        {tab === "details" ? (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contenu du cours</Text>
            <Text style={[styles.contentText, { color: colors.foreground }]}>{course.content}</Text>
          </Card>
        ) : null}
      </ScrollView>

      {/* Add student modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <ModalHeader title="Ajouter un étudiant" onClose={() => setShowAdd(false)} />
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
            <Input label="Nom" value={lastName} onChangeText={setLastName} placeholder="MUKENDI" />
            <Input label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Jean" />
            <Input label="Matricule" value={matricule} onChangeText={setMatricule} placeholder="UPC2025001" />
            <Button title="Ajouter" onPress={onAddStudent} fullWidth size="lg" />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showBulk} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBulk(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <ModalHeader title="Import en masse" onClose={() => setShowBulk(false)} />
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 }}>
              Une ligne par étudiant au format :{"\n"}
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Nom, Prénom, Matricule</Text>
            </Text>
            <Input
              value={bulkText}
              onChangeText={setBulkText}
              placeholder={"MUKENDI, Jean, UPC2025001\nKABILA, Marie, UPC2025002"}
              multiline
              style={{ minHeight: 220 }}
            />
            <Button title="Importer" onPress={onBulkImport} fullWidth size="lg" />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}>{title}</Text>
      <Pressable onPress={onClose} hitSlop={12}>
        <Feather name="x" size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

function TabBtn({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabBtn,
        { backgroundColor: active ? colors.background : "transparent" },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
          color: active ? colors.primary : colors.mutedForeground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ label, value, colors }: { label: string; value: string | number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: colors.primary, fontSize: 18, fontFamily: "Inter_700Bold" }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  meta: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 12, lineHeight: 20 },
  statsRow: { flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  tabs: { flexDirection: "row", borderRadius: 10, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  studentName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  studentMat: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  contentText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
