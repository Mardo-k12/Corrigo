import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { aiGenerateExam } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function ExamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, exams, addExam } = useData();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");
  const [examType, setExamType] = useState<"qcm" | "ouvert" | "mixte">("mixte");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coursesById = useMemo(() => {
    const m = new Map(courses.map((c) => [c.id, c]));
    return m;
  }, [courses]);

  const generate = async () => {
    setError(null);
    if (!selectedCourseId) {
      setError("Choisissez un cours");
      return;
    }
    const course = coursesById.get(selectedCourseId);
    if (!course) return;
    const n = Math.max(1, Math.min(30, Number(numQuestions) || 10));
    setGenerating(true);
    try {
      const generated = await aiGenerateExam({
        courseContent: course.content,
        courseTitle: course.title,
        numQuestions: n,
        difficulty,
        type: examType,
      });
      const exam = await addExam({
        courseId: course.id,
        title: generated.title || `Examen ${course.title}`,
        instructions: generated.instructions || "",
        totalPoints: Number(generated.totalPoints) || 20,
        durationMinutes: Number(generated.durationMinutes) || 60,
        difficulty,
        type: examType,
        questions: Array.isArray(generated.questions) ? generated.questions : [],
      });
      setShowCreate(false);
      setSelectedCourseId(null);
      router.push(`/exam/${exam.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de génération");
    } finally {
      setGenerating(false);
    }
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
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.foreground }]}>Examens</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Générez des sujets d'examen avec l'IA.
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (courses.length === 0) {
              setError("Créez d'abord un cours");
              return;
            }
            setShowCreate(true);
            setSelectedCourseId(courses[0]?.id ?? null);
          }}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newBtnText}>Générer</Text>
        </Pressable>
      </View>

      <FlatList
        data={exams}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100 + webBottomInset,
          gap: 12,
        }}
        renderItem={({ item }) => {
          const course = coursesById.get(item.courseId);
          return (
            <Card onPress={() => router.push(`/exam/${item.id}`)}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <View style={[styles.examIcon, { backgroundColor: colors.primarySoft }]}>
                  <Feather name="file-text" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.examTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {course ? (
                    <Text style={[styles.examMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {course.title} · {formatDate(item.createdAt)}
                    </Text>
                  ) : null}
                  <View style={styles.examPills}>
                    <Pill text={`${item.questions.length} questions`} colors={colors} />
                    <Pill text={`${item.durationMinutes} min`} colors={colors} />
                    <Pill text={item.difficulty} colors={colors} />
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="Aucun examen généré"
            description="L'IA peut générer un sujet complet (QCM, questions ouvertes, ou mixte) à partir de n'importe lequel de vos cours."
            action={
              courses.length > 0 ? (
                <Button
                  title="Générer un examen"
                  onPress={() => {
                    setShowCreate(true);
                    setSelectedCourseId(courses[0]?.id ?? null);
                  }}
                  icon={<Feather name="cpu" size={16} color="#fff" />}
                />
              ) : (
                <Button title="Créer un cours" onPress={() => router.push("/course/new")} />
              )
            }
          />
        }
      />

      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nouvel examen</Text>
            <Pressable onPress={() => setShowCreate(false)} hitSlop={12}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Card>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>COURS</Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                {courses.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCourseId(c.id)}
                    style={[
                      styles.courseOption,
                      {
                        backgroundColor:
                          c.id === selectedCourseId ? colors.primarySoft : colors.secondary,
                        borderColor: c.id === selectedCourseId ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.courseOptionTitle, { color: colors.foreground }]}>
                        {c.title}
                      </Text>
                      <Text style={[styles.courseOptionSub, { color: colors.mutedForeground }]}>
                        {c.subject}
                      </Text>
                    </View>
                    {c.id === selectedCourseId ? (
                      <Feather name="check-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </Card>

            <Input
              label="Nombre de questions"
              value={numQuestions}
              onChangeText={setNumQuestions}
              keyboardType="number-pad"
              placeholder="10"
            />

            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>
                NIVEAU DE DIFFICULTÉ
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["facile", "moyen", "difficile"] as const).map((d) => (
                  <SegmentBtn
                    key={d}
                    label={d}
                    active={difficulty === d}
                    onPress={() => setDifficulty(d)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>
                TYPE DE QUESTIONS
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["qcm", "ouvert", "mixte"] as const).map((t) => (
                  <SegmentBtn
                    key={t}
                    label={t === "qcm" ? "QCM" : t === "ouvert" ? "Ouvert" : "Mixte"}
                    active={examType === t}
                    onPress={() => setExamType(t)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
                <Feather name="alert-circle" size={16} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              title={generating ? "Génération en cours…" : "Générer le sujet d'examen"}
              onPress={generate}
              loading={generating}
              size="lg"
              fullWidth
              icon={generating ? undefined : <Feather name="cpu" size={18} color="#fff" />}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function SegmentBtn({
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
        styles.segBtn,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Inter_600SemiBold",
          color: active ? "#fff" : colors.foreground,
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Pill({ text, colors }: { text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: colors.secondary,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          color: colors.mutedForeground,
          textTransform: "capitalize",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
  },
  newBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  examTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  examMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  examPills: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  courseOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  courseOptionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  courseOptionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
});
