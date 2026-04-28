import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate, formatScore } from "@/lib/format";
import type { Course, Grade, Student } from "@/lib/types";

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, grades, gradesByCourse, students } = useData();
  const [selectedCourseId, setSelectedCourseId] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    if (selectedCourseId === "all") return grades;
    return gradesByCourse(selectedCourseId);
  }, [grades, selectedCourseId, gradesByCourse]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { avg: 0, success: 0, count: 0 };
    const avg = filtered.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / filtered.length;
    const success = filtered.filter((g) => g.score / g.maxScore >= 0.5).length;
    return {
      avg: Math.round(avg * 10) / 10,
      success: Math.round((success / filtered.length) * 100),
      count: filtered.length,
    };
  }, [filtered]);

  const histogram = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // <5, 5-9, 10-13, 14-16, 17-20
    filtered.forEach((g) => {
      const v = (g.score / g.maxScore) * 20;
      if (v < 5) buckets[0]!++;
      else if (v < 10) buckets[1]!++;
      else if (v < 14) buckets[2]!++;
      else if (v < 17) buckets[3]!++;
      else buckets[4]!++;
    });
    const max = Math.max(...buckets, 1);
    return { buckets, max };
  }, [filtered]);

  const studentsById = useMemo(() => {
    const m = new Map<string, Student>();
    students.forEach((s) => m.set(s.id, s));
    return m;
  }, [students]);

  const coursesById = useMemo(() => {
    const m = new Map<string, Course>();
    courses.forEach((c) => m.set(c.id, c));
    return m;
  }, [courses]);

  const exportCsv = async () => {
    if (filtered.length === 0) return;
    const header = "Date,Cours,Étudiant,Matricule,Note,Sur,Appréciation\n";
    const rows = filtered.map((g) => {
      const student = g.studentId ? studentsById.get(g.studentId) : undefined;
      const course = coursesById.get(g.courseId);
      const studentName = student ? `${student.lastName} ${student.firstName}` : "Anonyme";
      const matricule = student ? student.matricule : "";
      const apprec = (g.appreciation || "").replace(/[\r\n,;]/g, " ");
      return `${formatDate(g.createdAt)},"${course?.title ?? ""}","${studentName}",${matricule},${g.score},${g.maxScore},"${apprec}"`;
    }).join("\n");
    const csv = header + rows;
    try {
      await Share.share({ message: csv, title: "Export des notes" });
    } catch {}
  };

  const webBottomInset = Platform.OS === "web" ? 84 : 0;
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, webTopInset) + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: colors.foreground }]}>Notes & Relevés</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Suivez les performances de vos étudiants.
            </Text>
          </View>
          {filtered.length > 0 ? (
            <Pressable onPress={exportCsv} style={[styles.exportBtn, { borderColor: colors.border }]}>
              <Feather name="share" size={16} color={colors.primary} />
              <Text style={[styles.exportText, { color: colors.primary }]}>Exporter</Text>
            </Pressable>
          ) : null}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: "all", title: "Tous les cours" }, ...courses]}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ gap: 8, paddingTop: 14 }}
          renderItem={({ item }) => {
            const active = selectedCourseId === item.id;
            return (
              <Pressable
                onPress={() => setSelectedCourseId(item.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? "#fff" : colors.foreground },
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100 + webBottomInset,
          gap: 12,
        }}
        ListHeaderComponent={
          filtered.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 8 }}>
              <View style={styles.statsRow}>
                <StatBox label="Notes" value={String(stats.count)} colors={colors} />
                <StatBox label="Moyenne" value={`${stats.avg.toFixed(1)}/20`} colors={colors} />
                <StatBox label="Réussite" value={`${stats.success}%`} colors={colors} />
              </View>
              <Card>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_600SemiBold",
                    color: colors.foreground,
                    marginBottom: 12,
                  }}
                >
                  Distribution des notes
                </Text>
                <Histogram buckets={histogram.buckets} max={histogram.max} colors={colors} />
              </Card>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <GradeCard
            grade={item}
            student={item.studentId ? studentsById.get(item.studentId) : undefined}
            course={coursesById.get(item.courseId)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="award"
            title="Aucune note enregistrée"
            description="Lancez votre première correction depuis l'onglet Scanner."
          />
        }
      />
    </View>
  );
}

function StatBox({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.statBox,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function Histogram({
  buckets,
  max,
  colors,
}: {
  buckets: number[];
  max: number;
  colors: ReturnType<typeof useColors>;
}) {
  const labels = ["<5", "5-9", "10-13", "14-16", "17-20"];
  return (
    <View style={{ gap: 10 }}>
      {buckets.map((v, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ width: 44, fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
            {labels[i]}
          </Text>
          <View style={{ flex: 1, height: 16, backgroundColor: colors.secondary, borderRadius: 8 }}>
            <View
              style={{
                width: `${(v / max) * 100}%`,
                height: "100%",
                backgroundColor: i < 2 ? colors.destructive : i === 2 ? colors.warning : colors.success,
                borderRadius: 8,
                minWidth: v > 0 ? 6 : 0,
              }}
            />
          </View>
          <Text style={{ width: 24, textAlign: "right", fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
            {v}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GradeCard({
  grade,
  student,
  course,
}: {
  grade: Grade;
  student?: Student;
  course?: Course;
}) {
  const colors = useColors();
  return (
    <Card
      onPress={() => router.push({ pathname: "/grading/review", params: { gradeId: grade.id } })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.gradeName, { color: colors.foreground }]} numberOfLines={1}>
            {student ? `${student.lastName.toUpperCase()} ${student.firstName}` : "Copie anonyme"}
          </Text>
          <Text style={[styles.gradeMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {course?.title ?? "Cours supprimé"} · {formatDate(grade.createdAt)}
          </Text>
          {grade.appreciation ? (
            <Text style={[styles.gradeApprec, { color: colors.foreground }]} numberOfLines={2}>
              {grade.appreciation}
            </Text>
          ) : null}
          {!grade.validated ? (
            <View style={[styles.draftPill, { backgroundColor: "#fef3c7" }]}>
              <Feather name="edit-3" size={10} color="#b45309" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#b45309" }}>
                À VALIDER
              </Text>
            </View>
          ) : null}
        </View>
        <ScoreBadge score={grade.score} maxScore={grade.maxScore} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  h1: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  exportText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  gradeName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  gradeMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  gradeApprec: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    lineHeight: 18,
  },
  draftPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
});
