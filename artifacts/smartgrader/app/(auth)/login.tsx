import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.hero,
          { backgroundColor: colors.primary, paddingTop: Math.max(insets.top, webTopInset) + 32 },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Feather name="check" size={22} color={colors.primary} />
          </View>
          <Text style={styles.brand}>SmartGrader</Text>
          <View style={styles.upcChip}>
            <Text style={styles.upcText}>UPC</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>Corrigez vos copies{"\n"}en quelques secondes.</Text>
        <Text style={styles.heroSubtitle}>
          L'assistant de correction par IA pensé pour les enseignants de l'Université Protestante au
          Congo.
        </Text>
      </View>

      <View style={styles.formWrap}>
        <Text style={[styles.title, { color: colors.foreground }]}>Bon retour, professeur</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Connectez-vous à votre espace pour reprendre vos corrections.
        </Text>

        <View style={{ marginTop: 24 }}>
          <Input
            label="Adresse email"
            value={email}
            onChangeText={setEmail}
            placeholder="prenom.nom@upc.ac.cd"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <View style={{ height: 14 }} />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="current-password"
          />
          {error ? (
            <View style={{ height: 14 }} />
          ) : null}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}
          <View style={{ height: 14 }} />
          <Button title="Se connecter" onPress={onSubmit} loading={loading} fullWidth size="lg" />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Pas encore de compte ?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.link, { color: colors.primary }]}>Créer un compte</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brand: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  upcChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginLeft: 10,
  },
  upcText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    fontFamily: "Inter_400Regular",
  },
  formWrap: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  link: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
