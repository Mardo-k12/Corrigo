import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { aiGrade, aiOcr } from "@/lib/api";
import type { Course, Student } from "@/lib/types";

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, studentsByCourse, addGrade } = useData();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [maxScore, setMaxScore] = useState<10 | 20>(20);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");

  const [ocrText, setOcrText] = useState<string>("");
  const [stage, setStage] = useState<"idle" | "ocr" | "grading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const selectedCourse = useMemo<Course | undefined>(
    () => courses.find((c) => c.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const courseStudents = useMemo<Student[]>(
    () => (selectedCourseId ? studentsByCourse(selectedCourseId) : []),
    [selectedCourseId, studentsByCourse],
  );

  const selectedStudent = useMemo<Student | undefined>(
    () => courseStudents.find((s) => s.id === selectedStudentId),
    [courseStudents, selectedStudentId],
  );

  const reset = () => {
    setImageUri(null);
    setImageBase64(null);
    setOcrText("");
    setError(null);
  };

  const pickImage = async (source: "camera" | "library") => {
    setError(null);
    try {
      let perm;
      if (source === "camera") {
        perm = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!perm.granted) {
        setError("Permission refusée. Activez l'accès dans les paramètres.");
        return;
      }
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
        allowsEditing: false,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync(opts);

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 ?? null);
      setImageMime(asset.mimeType ?? "image/jpeg");
      setOcrText("");

      if (asset.base64) {
        await runOcr(asset.base64, asset.mimeType ?? "image/jpeg");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement de l'image");
    }
  };

  const runOcr = async (b64: string, mime: string) => {
    setStage("ocr");
    setError(null);
    try {
      const text = await aiOcr(b64, mime);
      setOcrText(text);
      if (!text.trim()) {
        setError("Aucun texte détecté dans l'image. Reprenez la photo en bonne lumière.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur OCR");
    } finally {
      setStage("idle");
    }
  };

  const runGrading = async () => {
    if (!selectedCourse || !ocrText.trim()) return;
    setStage("grading");
    setError(null);
    try {
      const result = await aiGrade({
        studentText: ocrText,
        courseContent: selectedCourse.summary || selectedCourse.content,
        courseTitle: selectedCourse.title,
        maxScore,
      });
      const grade = await addGrade({
        courseId: selectedCourse.id,
        studentId: selectedStudentId ?? undefined,
        scannedText: ocrText,
        imageUri: imageUri ?? undefined,
        score: result.score,
        maxScore: result.maxScore,
        appreciation: result.appreciation,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestion: result.suggestion,
        validated: false,
      });
      router.push({ pathname: "/grading/review", params: { gradeId: grade.id } });
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la correction");
    } finally {
      setStage("idle");
    }
  };

  const webBottomInset = Platform.OS === "web" ? 84 : 0;
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, webTopInset) + 16,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100 + webBottomInset,
          gap: 16,
        }}
      >
        <View>
          <Text style={[styles.h1, { color: colors.foreground }]}>Scanner une copie</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Photographiez une copie manuscrite, l'IA fait le reste.
          </Text>
        </View>

        {/* Course selection */}
        <Card padding={14}>
          <Pressable onPress={() => setShowCourseModal(true)} style={styles.selectorRow}>
            <View style={[styles.selectorIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="book-open" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>Cours</Text>
              <Text
                style={[styles.selectorValue, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {selectedCourse?.title ?? "Choisir un cours"}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </Card>

        <Card padding={14}>
          <Pressable
            onPress={() => selectedCourseId && setShowStudentModal(true)}
            style={[styles.selectorRow, { opacity: selectedCourseId ? 1 : 0.5 }]}
            disabled={!selectedCourseId}
          >
            <View style={[styles.selectorIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>
                Étudiant (optionnel)
              </Text>
              <Text
                style={[styles.selectorValue, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {selectedStudent
                  ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                  : "Anonyme"}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </Card>

        <Card padding={14}>
          <Text style={[styles.selectorLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>
            Barème
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[10, 20].map((v) => (
              <Pressable
                key={v}
                onPress={() => setMaxScore(v as 10 | 20)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: maxScore === v ? colors.primary : colors.secondary,
                    borderColor: maxScore === v ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: maxScore === v ? "#fff" : colors.foreground },
                  ]}
                >
                  Sur {v}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Image area */}
        <Card padding={0}>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <Pressable
                onPress={reset}
                style={[styles.removeBtn, { backgroundColor: "rgba(0,0,0,0.6)" }]}
              >
                <Feather name="x" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.previewPlaceholder}>
              <Feather name="image" size={36} color={colors.mutedForeground} />
              <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Aucune image sélectionnée
              </Text>
            </View>
          )}

          <View style={styles.imageActions}>
            <Button
              title="Prendre une photo"
              variant="outline"
              size="sm"
              onPress={() => pickImage("camera")}
              icon={<Feather name="camera" size={16} color={colors.primary} />}
              style={{ flex: 1 }}
            />
            <Button
              title="Galerie"
              variant="outline"
              size="sm"
              onPress={() => pickImage("library")}
              icon={<Feather name="image" size={16} color={colors.primary} />}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {stage === "ocr" ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.body, { color: colors.foreground }]}>
                Extraction du texte en cours…
              </Text>
            </View>
          </Card>
        ) : null}

        {ocrText ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Feather name="file-text" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Texte extrait</Text>
            </View>
            <Text style={[styles.body, { color: colors.foreground }]} numberOfLines={8}>
              {ocrText}
            </Text>
          </Card>
        ) : null}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {ocrText && selectedCourse ? (
          <Button
            title={stage === "grading" ? "Correction en cours…" : "Lancer la correction IA"}
            onPress={runGrading}
            loading={stage === "grading"}
            size="lg"
            fullWidth
            icon={
              stage === "grading" ? undefined : (
                <Feather name="cpu" size={18} color="#fff" />
              )
            }
          />
        ) : null}

        {courses.length === 0 ? (
          <EmptyState
            icon="book-open"
            title="Créez d'abord un cours"
            description="Le scanner a besoin d'un cours pour comparer la copie au contenu enseigné."
            action={
              <Button
                title="Créer un cours"
                onPress={() => router.push("/course/new")}
                size="md"
              />
            }
          />
        ) : null}
      </ScrollView>

      {/* Course picker */}
      <Modal
        visible={showCourseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <PickerSheet
          title="Choisir un cours"
          onClose={() => setShowCourseModal(false)}
        >
          <FlatList
            data={courses}
            keyExtractor={(c) => c.id}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border }} />
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedCourseId(item.id);
                  setSelectedStudentId(null);
                  setShowCourseModal(false);
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      item.id === selectedCourseId ? colors.primarySoft : "transparent",
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                    {item.subject} · {item.semester}
                  </Text>
                </View>
                {item.id === selectedCourseId ? (
                  <Feather name="check" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            )}
          />
        </PickerSheet>
      </Modal>

      {/* Student picker */}
      <Modal
        visible={showStudentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStudentModal(false)}
      >
        <PickerSheet title="Choisir un étudiant" onClose={() => setShowStudentModal(false)}>
          <Pressable
            onPress={() => {
              setSelectedStudentId(null);
              setShowStudentModal(false);
            }}
            style={[
              styles.row,
              {
                backgroundColor:
                  selectedStudentId === null ? colors.primarySoft : "transparent",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Anonyme</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                Aucun étudiant lié
              </Text>
            </View>
            {selectedStudentId === null ? (
              <Feather name="check" size={20} color={colors.primary} />
            ) : null}
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <FlatList
            data={courseStudents}
            keyExtractor={(s) => s.id}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.border }} />
            )}
            ListEmptyComponent={
              <View style={{ padding: 24 }}>
                <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
                  Aucun étudiant inscrit dans ce cours.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedStudentId(item.id);
                  setShowStudentModal(false);
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      item.id === selectedStudentId ? colors.primarySoft : "transparent",
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                    {item.lastName.toUpperCase()} {item.firstName}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                    Mat. {item.matricule}
                  </Text>
                </View>
                {item.id === selectedStudentId ? (
                  <Feather name="check" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            )}
          />
        </PickerSheet>
      </Modal>
    </View>
  );
}

function PickerSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}
        >
          {title}
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectorValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  preview: {
    width: "100%",
    height: 240,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  previewPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  imageActions: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  rowSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
