import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { Input } from "@/components/Input";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate, gradeLabel } from "@/lib/format";
import type { Student } from "@/lib/types";

export default function GradeReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { gradeId } = useLocalSearchParams<{ gradeId: string }>();
  const { getGrade, updateGrade, deleteGrade, courses, studentsByCourse } = useData();

  const grade = useMemo(() => (gradeId ? getGrade(gradeId) : undefined), [getGrade, gradeId]);
  const course = useMemo(() => courses.find((c) => c.id === grade?.courseId), [courses, grade]);

  const [scoreText, setScoreText] = useState("");
  const [appreciation, setAppreciation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);

  useEffect(() => {
    if (grade) {
      setScoreText(String(grade.score));
      setAppreciation(grade.appreciation);
      setSuggestion(grade.suggestion);
      setStudentId(grade.studentId ?? null);
    }
  }, [grade]);

  if (!grade || !course) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Note introuvable</Text>
      </View>
    );
  }

  const courseStudents = studentsByCourse(grade.courseId);
  const student = courseStudents.find((s) => s.id === studentId);

  const onValidate = async () => {
    const parsed = Number(scoreText.replace(",", "."));
    const finalScore = Math.max(0, Math.min(grade.maxScore, isNaN(parsed) ? grade.score : parsed));
    await updateGrade(grade.id, {
      score: finalScore,
      appreciation,
      suggestion,
      studentId: studentId ?? undefined,
      validated: true,
    });
    router.back();
  };

  const onDelete = () => {
    if (Platform.OS === "web") {
      deleteGrade(grade.id).then(() => router.back());
      return;
    }
    Alert.alert("Supprimer cette note ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteGrade(grade.id);
          router.back();
        },
      },
    ]);
  };

  const shareGrade = async () => {
    const lines = [
      `CORRECTION - ${course.title}`,
      student
        ? `Étudiant : ${student.lastName.toUpperCase()} ${student.firstName} (${student.matricule})`
        : "Étudiant : Anonyme",
      `Date : ${formatDate(grade.createdAt)}`,
      `Note : ${grade.score}/${grade.maxScore} (${gradeLabel(grade.score, grade.maxScore)})`,
      "",
      "APPRÉCIATION :",
      appreciation,
      "",
      "SUGGESTIONS :",
      suggestion,
    ];
    try {
      await Share.share({ message: lines.join("\n"), title: "Correction" });
    } catch {}
  };

  const currentScore = Number(scoreText.replace(",", ".")) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Correction",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable onPress={shareGrade} hitSlop={10}>
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
          paddingBottom: insets.bottom + 100,
          gap: 16,
        }}
      >
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <ScoreBadge
              score={currentScore || grade.score}
              maxScore={grade.maxScore}
              size="lg"
              showLabel
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subject, { color: colors.mutedForeground }]}>{course.title}</Text>
              <Text style={[styles.courseTitle, { color: colors.foreground }]}>
                {student ? `${student.lastName.toUpperCase()} ${student.firstName}` : "Copie anonyme"}
              </Text>
              <Text style={[styles.subject, { color: colors.mutedForeground }]}>
                {formatDate(grade.createdAt)}
              </Text>
            </View>
          </View>
        </Card>

        <Card padding={14}>
          <Pressable
            onPress={() => setShowStudentPicker(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <View style={[styles.iconBg, { backgroundColor: colors.primarySoft }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>ÉTUDIANT</Text>
              <Text style={[styles.fieldValue, { color: colors.foreground }]} numberOfLines={1}>
                {student ? `${student.lastName.toUpperCase()} ${student.firstName}` : "Lier un étudiant…"}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </Card>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Note finale</Text>
          <Text style={[styles.cardHelp, { color: colors.mutedForeground }]}>
            La note proposée par l'IA est modifiable.
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Input value={scoreText} onChangeText={setScoreText} keyboardType="decimal-pad" />
            </View>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                paddingBottom: 12,
              }}
            >
              / {grade.maxScore}
            </Text>
          </View>
        </Card>

        {grade.strengths.length > 0 || grade.weaknesses.length > 0 ? (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Analyse de l'IA</Text>
            {grade.strengths.length > 0 ? (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.subhead, { color: colors.success }]}>Points forts</Text>
                {grade.strengths.map((s, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Feather name="check" size={14} color={colors.success} style={{ marginTop: 2 }} />
                    <Text style={[styles.bulletText, { color: colors.foreground }]}>{s}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {grade.weaknesses.length > 0 ? (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.subhead, { color: colors.destructive }]}>À améliorer</Text>
                {grade.weaknesses.map((w, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Feather name="alert-triangle" size={14} color={colors.destructive} style={{ marginTop: 2 }} />
                    <Text style={[styles.bulletText, { color: colors.foreground }]}>{w}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ) : null}

        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Appréciation</Text>
          <Input
            value={appreciation}
            onChangeText={setAppreciation}
            multiline
            placeholder="Commentaire général…"
            style={{ minHeight: 90, marginTop: 8 }}
          />
        </Card>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Suggestions de correction</Text>
          <Input
            value={suggestion}
            onChangeText={setSuggestion}
            multiline
            placeholder="Pistes d'amélioration et corrigé attendu…"
            style={{ minHeight: 120, marginTop: 8 }}
          />
        </Card>

        {grade.scannedText ? (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Texte de la copie (OCR)</Text>
            <Text style={[styles.body, { color: colors.mutedForeground, marginTop: 8 }]}>
              {grade.scannedText}
            </Text>
          </Card>
        ) : null}

        <Button
          title={grade.validated ? "Mettre à jour" : "Valider la correction"}
          onPress={onValidate}
          fullWidth
          size="lg"
          icon={<Feather name="check" size={18} color="#fff" />}
        />
      </ScrollView>

      <Modal
        visible={showStudentPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStudentPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
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
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}>
              Choisir un étudiant
            </Text>
            <Pressable onPress={() => setShowStudentPicker(false)} hitSlop={12}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView>
            <Pressable
              onPress={() => {
                setStudentId(null);
                setShowStudentPicker(false);
              }}
              style={[
                styles.pickerRow,
                {
                  backgroundColor: studentId === null ? colors.primarySoft : "transparent",
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Anonyme</Text>
            </Pressable>
            {courseStudents.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => {
                  setStudentId(s.id);
                  setShowStudentPicker(false);
                }}
                style={[
                  styles.pickerRow,
                  {
                    backgroundColor: studentId === s.id ? colors.primarySoft : "transparent",
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                    {s.lastName.toUpperCase()} {s.firstName}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                    {s.matricule}
                  </Text>
                </View>
                {studentId === s.id ? <Feather name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
            {courseStudents.length === 0 ? (
              <Text style={{ padding: 24, textAlign: "center", color: colors.mutedForeground }}>
                Aucun étudiant dans ce cours.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  subject: { fontSize: 12, fontFamily: "Inter_500Medium" },
  courseTitle: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2, marginVertical: 2 },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardHelp: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  subhead: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bulletRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
});
