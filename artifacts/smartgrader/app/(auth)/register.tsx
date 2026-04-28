import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollViewCompat as KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("Université Protestante au Congo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, name, institution });
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.wrap,
          {
            paddingTop: Math.max(insets.top, webTopInset) + 16,
            paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 24) + 24,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>Créer votre compte</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Rejoignez SmartGrader pour automatiser la correction de vos examens.
        </Text>

        <View style={{ gap: 14, marginTop: 28 }}>
          <Input
            label="Nom complet"
            value={name}
            onChangeText={setName}
            placeholder="Prof. Jean Mukendi"
            autoComplete="name"
          />
          <Input
            label="Institution"
            value={institution}
            onChangeText={setInstitution}
            placeholder="Université Protestante au Congo"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="prenom.nom@upc.ac.cd"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="6 caractères minimum"
            secureTextEntry
            autoComplete="new-password"
          />
          <Input
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
          />
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructiveSoft }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}
          <Button title="Créer mon compte" onPress={onSubmit} loading={loading} fullWidth size="lg" />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Déjà inscrit ?
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.link, { color: colors.primary }]}>Se connecter</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24 },
  back: { marginBottom: 16, alignSelf: "flex-start" },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
