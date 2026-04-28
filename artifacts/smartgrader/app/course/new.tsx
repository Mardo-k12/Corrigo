import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollViewCompat as KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { aiOcr, aiSummarizeCourse } from "@/lib/api";

export default function NewCourseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCourse } = useData();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("S1 2025");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const importFromImage = async () => {
    setError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError("Permission galerie refusée");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;
      setImporting(true);
      const text = await aiOcr(result.assets[0].base64, result.assets[0].mimeType ?? "image/jpeg");
      setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'import");
    } finally {
      setImporting(false);
    }
  };

  const summarize = async () => {
    if (!content.trim()) {
      setError("Ajoutez d'abord du contenu");
      return;
    }
    setSummarizing(true);
    setError(null);
    try {
      const summary = await aiSummarizeCourse(content, title || "Cours");
      setContent((prev) => `${prev}\n\n--- RÉSUMÉ IA ---\n${summary}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de résumé");
    } finally {
      setSummarizing(false);
    }
  };

  const onCreate = async () => {
    setError(null);
    if (!title.trim()) return setError("Le titre est requis");
    if (!content.trim()) return setError("Ajoutez du contenu pour permettre la correction");
    setLoading(true);
    try {
      const course = await addCourse({
        title: title.trim(),
        subject: subject.trim(),
        semester: semester.trim(),
        description: description.trim(),
        content: content.trim(),
      });
      router.replace(`/course/${course.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 24) + 24,
          gap: 16,
        }}
      >
        <Input
          label="Titre du cours"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Algorithmique avancée"
        />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Matière"
              value={subject}
              onChangeText={setSubject}
              placeholder="Informatique"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Semestre" value={semester} onChangeText={setSemester} />
          </View>
        </View>
        <Input
          label="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          placeholder="Objectifs du cours, public cible…"
          multiline
        />

        <Card padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contenu du cours</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                Saisissez ou photographiez les pages du cours.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <Button
              title={importing ? "Lecture…" : "Photo"}
              onPress={importFromImage}
              variant="outline"
              size="sm"
              loading={importing}
              icon={importing ? undefined : <Feather name="camera" size={14} color={colors.primary} />}
              style={{ flex: 1 }}
            />
            <Button
              title={summarizing ? "Résumé…" : "Résumer IA"}
              onPress={summarize}
              variant="outline"
              size="sm"
              loading={summarizing}
              disabled={!content.trim()}
              icon={summarizing ? undefined : <Feather name="cpu" size={14} color={colors.primary} />}
              style={{ flex: 1 }}
            />
          </View>
          <Input
            value={content}
            onChangeText={setContent}
            placeholder="Saisissez ou collez le contenu du cours ici…"
            multiline
            style={{ minHeight: 200 }}
          />
        </Card>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Button
          title="Créer le cours"
          onPress={onCreate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Feather name="check" size={18} color="#fff" />}
        />
        <Pressable onPress={() => router.back()} style={{ alignSelf: "center", padding: 8 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
            Annuler
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
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
