import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/format";
import type { Course } from "@/lib/types";

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, students, grades, exams } = useData();

  const stats = useMemo(() => {
    const corrected = grades.filter((g) => g.validated).length;
    const total = grades.length;
    const avg =
      total > 0
        ? grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / total
        : 0;
    return {
      coursesCount: courses.length,
      studentsCount: students.length,
      gradesCount: total,
      correctedCount: corrected,
      avg: Math.round(avg * 10) / 10,
      examsCount: exams.length,
    };
  }, [courses, students, grades, exams]);

  const webBottomInset = Platform.OS === "web" ? 84 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={courses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100 + webBottomInset,
        }}
        ListHeaderComponent={
          <Header
            userName={user?.name ?? ""}
            stats={stats}
            colors={colors}
            insetsTop={Math.max(insets.top, Platform.OS === "web" ? 67 : 0)}
          />
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <CourseRow course={item} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-open"
            title="Aucun cours pour le moment"
            description="Importez votre premier cours pour démarrer la correction automatique des copies."
            action={
              <Button
                title="Créer un cours"
                onPress={() => router.push("/course/new")}
                icon={<Feather name="plus" size={18} color="#fff" />}
              />
            }
          />
        }
      />

      {courses.length > 0 ? (
        <Pressable
          onPress={() => router.push("/course/new")}
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              bottom: insets.bottom + 24 + webBottomInset,
            },
          ]}
        >
          <Feather name="plus" size={24} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

function Header({
  userName,
  stats,
  colors,
  insetsTop,
}: {
  userName: string;
  stats: {
    coursesCount: number;
    studentsCount: number;
    gradesCount: number;
    correctedCount: number;
    avg: number;
    examsCount: number;
  };
  colors: ReturnType<typeof useColors>;
  insetsTop: number;
}) {
  const firstName = userName.split(" ")[0] ?? userName;
  return (
    <View>
      <LinearGradient
        colors={[colors.primary, "#0f1e5e"]}
        style={[styles.hero, { paddingTop: insetsTop + 16 }]}
      >
        <Text style={styles.greeting}>Bonjour, Pr. {firstName}</Text>
        <Text style={styles.heroTitle}>Tableau de bord</Text>

        <View style={styles.statsRow}>
          <StatCard label="Cours" value={stats.coursesCount} />
          <StatCard label="Étudiants" value={stats.studentsCount} />
          <StatCard label="Corrections" value={stats.gradesCount} />
        </View>

        <View style={styles.avgRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.avgLabel}>Moyenne générale</Text>
            <Text style={styles.avgValue}>
              {stats.gradesCount > 0 ? `${stats.avg.toFixed(1)} /20` : "—"}
            </Text>
          </View>
          <View style={styles.examsBadge}>
            <Feather name="file-text" size={14} color="#fff" />
            <Text style={styles.examsText}>{stats.examsCount} examens</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes cours</Text>
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CourseRow({ course }: { course: Course }) {
  const colors = useColors();
  const { studentsByCourse, gradesByCourse } = useData();
  const studentsCount = studentsByCourse(course.id).length;
  const gradesCount = gradesByCourse(course.id).length;

  return (
    <Card onPress={() => router.push(`/course/${course.id}`)}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={[styles.courseIcon, { backgroundColor: colors.primarySoft }]}>
          <Feather name="book" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={1}>
              {course.title}
            </Text>
          </View>
          {course.subject ? (
            <Text style={[styles.courseSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {course.subject} · {course.semester}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Feather name="users" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {studentsCount} étudiants
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Feather name="check-circle" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {gradesCount} notes
              </Text>
            </View>
            <Text style={[styles.metaDate, { color: colors.mutedForeground }]}>
              {formatDate(course.createdAt)}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  avgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  avgLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  avgValue: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  examsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  examsText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  courseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  courseSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  metaDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginLeft: "auto",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
      default: { boxShadow: "0px 4px 12px rgba(0,0,0,0.2)" },
    }),
  },
});
