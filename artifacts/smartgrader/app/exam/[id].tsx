import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
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
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/format";

export default function ExamDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exams, courses, deleteExam } = useData();
  const [showAnswers, setShowAnswers] = useState(false);

  const exam = useMemo(() => exams.find((e) => e.id === id), [exams, id]);
  const course = useMemo(() => courses.find((c) => c.id === exam?.courseId), [courses, exam]);

  if (!exam || !course) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Examen introuvable</Text>
      </View>
    );
  }

  const onShare = async () => {
    const lines = [
      `${exam.title.toUpperCase()}`,
      `Cours : ${course.title}`,
      `${course.semester} · Durée : ${exam.durationMinutes} min · Total : ${exam.totalPoints} pts`,
      "",
      exam.instructions,
      "",
      "─".repeat(40),
      "",
    ];
    exam.questions.forEach((q, i) => {
      lines.push(`Question ${i + 1} (${q.points} pts) - ${q.type === "qcm" ? "QCM" : "Question ouverte"}`);
      lines.push(q.statement);
      if (q.type === "qcm" && q.options) {
        q.options.forEach((opt, j) => {
          lines.push(`   ${String.fromCharCode(65 + j)}. ${opt}`);
        });
      }
      if (showAnswers && q.answer) lines.push(`Réponse : ${q.answer}`);
      lines.push("");
    });
    try {
      await Share.share({ message: lines.join("\n"), title: exam.title });
    } catch {}
  };

  const onDelete = () => {
    const action = async () => {
      await deleteExam(exam.id);
      router.back();
    };
    if (Platform.OS === "web") {
      action();
      return;
    }
    Alert.alert("Supprimer cet examen ?", "", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: action },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Examen",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable onPress={onShare} hitSlop={10}>
                <Feather name="share" size={20} color={colors.primary} />
              </Pressable>
              <Pressable onPress={onDelete} hitSlop={10}>
                <Feather name="trash-2" size={20} color={colors.destructive} />
              </Pressable>
            </View>
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
          <Text style={[styles.title, { color: colors.foreground }]}>{exam.title}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {course.title} · {course.semester}
          </Text>
          <View style={styles.metaRow}>
            <MetaPill icon="list" label={`${exam.questions.length} questions`} colors={colors} />
            <MetaPill icon="clock" label={`${exam.durationMinutes} min`} colors={colors} />
            <MetaPill icon="award" label={`${exam.totalPoints} pts`} colors={colors} />
          </View>
          {exam.instructions ? (
            <Text style={[styles.instructions, { color: colors.foreground }]}>{exam.instructions}</Text>
          ) : null}
        </Card>

        <Pressable
          onPress={() => setShowAnswers(!showAnswers)}
          style={[
            styles.toggleAnswers,
            { backgroundColor: showAnswers ? colors.primary : colors.secondary },
          ]}
        >
          <Feather name={showAnswers ? "eye-off" : "eye"} size={16} color={showAnswers ? "#fff" : colors.foreground} />
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
              color: showAnswers ? "#fff" : colors.foreground,
            }}
          >
            {showAnswers ? "Masquer le corrigé" : "Afficher le corrigé"}
          </Text>
        </Pressable>

        {exam.questions.map((q, i) => (
          <Card key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={[styles.qNum, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 }}>{i + 1}</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: q.type === "qcm" ? colors.primarySoft : "#fef3c7",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter_700Bold",
                    color: q.type === "qcm" ? colors.primary : "#b45309",
                    letterSpacing: 0.5,
                  }}
                >
                  {q.type === "qcm" ? "QCM" : "QUESTION OUVERTE"}
                </Text>
              </View>
              <Text style={[styles.points, { color: colors.mutedForeground }]}>{q.points} pts</Text>
            </View>
            <Text style={[styles.statement, { color: colors.foreground }]}>{q.statement}</Text>

            {q.type === "qcm" && q.options ? (
              <View style={{ marginTop: 10, gap: 6 }}>
                {q.options.map((opt, j) => (
                  <View
                    key={j}
                    style={[
                      styles.option,
                      {
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.optionLetter, { color: colors.primary }]}>
                      {String.fromCharCode(65 + j)}.
                    </Text>
                    <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {showAnswers && q.answer ? (
              <View style={[styles.answerBox, { backgroundColor: colors.successSoft }]}>
                <Text style={[styles.answerLabel, { color: colors.success }]}>RÉPONSE ATTENDUE</Text>
                <Text style={[styles.answerText, { color: colors.foreground }]}>{q.answer}</Text>
              </View>
            ) : null}
          </Card>
        ))}

        <Button
          title="Partager le sujet"
          onPress={onShare}
          variant="outline"
          fullWidth
          size="lg"
          icon={<Feather name="share" size={18} color={colors.primary} />}
        />
      </ScrollView>
    </View>
  );
}

function MetaPill({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.secondary,
        borderRadius: 6,
      }}
    >
      <Feather name={icon} size={11} color={colors.mutedForeground} />
      <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  meta: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  instructions: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 12, lineHeight: 20 },
  toggleAnswers: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  qNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  points: { fontSize: 12, fontFamily: "Inter_500Medium", marginLeft: "auto" },
  statement: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 21 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionLetter: { fontSize: 13, fontFamily: "Inter_700Bold", width: 18 },
  optionText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  answerBox: { marginTop: 12, padding: 12, borderRadius: 10, gap: 4 },
  answerLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  answerText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
