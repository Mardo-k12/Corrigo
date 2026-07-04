import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const { courses, students, grades, exams } = useData();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");

  const onSave = async () => {
    await updateProfile({ name, institution });
    setEditing(false);
  };

  const onLogout = () => {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/(auth)/login"));
      return;
    }
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <Text style={[styles.h1, { color: colors.foreground }]}>Profil</Text>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
              <Text style={[styles.email, { color: colors.mutedForeground }]} numberOfLines={1}>
                {user?.email}
              </Text>
              {user?.institution ? (
                <Text style={[styles.institution, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {user.institution}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={() => setEditing(!editing)} hitSlop={10}>
              <Feather name={editing ? "x" : "edit-2"} size={20} color={colors.primary} />
            </Pressable>
          </View>

          {editing ? (
            <View style={{ gap: 12, marginTop: 16 }}>
              <Input label="Nom" value={name} onChangeText={setName} />
              <Input label="Institution" value={institution} onChangeText={setInstitution} />
              <Button title="Enregistrer" onPress={onSave} fullWidth />
            </View>
          ) : null}
        </Card>

        <View style={styles.statsRow}>
          <StatBlock icon="book-open" label="Cours" value={courses.length} colors={colors} />
          <StatBlock icon="users" label="Étudiants" value={students.length} colors={colors} />
        </View>
        <View style={styles.statsRow}>
          <StatBlock icon="award" label="Notes" value={grades.length} colors={colors} />
          <StatBlock icon="file-text" label="Examens" value={exams.length} colors={colors} />
        </View>

        <Card padding={0}>
          <SettingRow
            icon="info"
            label="À propos de CORRIGO"
            description="Application de correction par IA pour enseignants."
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingRow
            icon="shield"
            label="Données synchronisées"
            description="Vos cours, examens et notes sont synchronisés avec l'API Corrigo."
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingRow
            icon="cpu"
            label="IA Gemini"
            description="L'OCR et la correction utilisent Google Gemini."
            colors={colors}
          />
        </Card>

        <Button
          title="Se déconnecter"
          variant="destructive"
          onPress={onLogout}
          fullWidth
          icon={<Feather name="log-out" size={16} color="#fff" />}
        />

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          CORRIGO · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

function StatBlock({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.statBlock,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  name: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  email: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  institution: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBlock: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  footer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
});
