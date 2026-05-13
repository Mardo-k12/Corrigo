# 🔧 Guide de Troubleshooting - Corrigo

Problèmes courants et solutions pour **Corrigo**.

---

## 📦 Problèmes de Dépendances

### ❌ Erreur: "lightningcss.win32-x64-msvc.node not found"

**Cause** : Les binaires natifs de `lightningcss` ne sont pas compilés pour votre plateforme (Windows).

**Solutions** :

1. **Régénérer les binaires** (Recommandé)
```bash
cd Corrigo
rm pnpm-lock.yaml
pnpm store prune
pnpm install --force
```

2. **Si ça persiste** : Vérifier le `pnpm-workspace.yaml`
   - Les dépendances optionnelles de `lightningcss` pour Windows ne doivent pas être désactivées
   - Vérifié : Les entrées `lightningcss>lightningcss-win32-*` ont été supprimées

3. **Dernière option** : Réinstaller en clean
```bash
rm -r node_modules
rm pnpm-lock.yaml
pnpm install
```

---

### ❌ Erreur: "cross-env not found"

**Cause** : `cross-env` est manquant des dépendances de `api-server`.

**Solution** :
```bash
pnpm -C artifacts/api-server add -D cross-env
```

---

### ❌ Erreur: "Cannot find module '@workspace/...' "

**Cause** : Les workspaces n'ont pas été installés correctement.

**Solutions** :

1. Vérifiez que le `pnpm-workspace.yaml` est correct :
```yaml
packages:
  - 'artifacts/**'
  - 'lib/**'
  - 'scripts/**'
```

2. Réinstallez les dépendances :
```bash
pnpm install
```

3. Si un package est nouveau, ajoutez-le à `pnpm-workspace.yaml`

---

### ❌ Erreur: "Module not found" pour des fichiers compilés

**Cause** : Les fichiers TypeScript n'ont pas été compilés en JavaScript.

**Solution** :
```bash
# Compiler tous les packages
pnpm build

# Ou un package spécifique
pnpm -C artifacts/api-server run build
```

---

## 🌐 Problèmes Frontend

### ❌ "PORT environment variable is required"

**Cause** : Le `.env.local` n'est pas défini pour `mockup-sandbox`.

**Solution** :

Créez `artifacts/mockup-sandbox/.env.local` :
```env
PORT=5173
BASE_PATH=/
```

Ou lancez avec les variables d'env :
```bash
PORT=5173 BASE_PATH=/ pnpm -C artifacts/mockup-sandbox dev
```

---

### ❌ Page blanche sur http://localhost:5173/

**Causes possibles** :

1. **Erreur de compilation** → Vérifiez la console du navigateur (F12)
2. **API server pas lancé** → Lancez `pnpm -C artifacts/api-server dev`
3. **Import manquant** → Vérifiez les erreurs dans le terminal

**Solution** :
```bash
# Vérifier les erreurs TypeScript
pnpm typecheck

# Reconstruire
pnpm -C artifacts/mockup-sandbox run build

# Lancer en debug
pnpm -C artifacts/mockup-sandbox dev -- --inspect
```

---

### ❌ Erreur CORS: "Access to XMLHttpRequest blocked"

**Cause** : L'API server n'a pas activé CORS pour le frontend.

**Vérifier** dans `artifacts/api-server/src/app.ts` :
```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

### ❌ Styles Tailwind CSS ne s'appliquent pas

**Cause** : `@tailwindcss/vite` n'a pas compilé les styles.

**Solutions** :

1. Vérifiez `artifacts/mockup-sandbox/vite.config.ts` :
```typescript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

2. Vérifiez que `src/index.css` importe Tailwind :
```css
@import "tailwindcss";
```

3. Relancez le dev server et rafraîchissez le navigateur

---

## ⚙️ Problèmes Backend

### ❌ "AI_INTEGRATIONS_GEMINI_API_KEY must be set"

**Cause** : Les variables d'env Gemini ne sont pas configurées.

**Solution** :

1. Créez `artifacts/api-server/.env.local` :
```env
AI_INTEGRATIONS_GEMINI_API_KEY=AIzaSy...
AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

2. Obtenez une clé API sur [Google Cloud Console](https://console.cloud.google.com/)

3. Assurez-vous que **Generative Language API** est activée

---

### ❌ "Cannot connect to database"

**Cause** : PostgreSQL n'est pas en cours d'exécution ou `DATABASE_URL` est incorrect.

**Solutions** :

1. Vérifiez que PostgreSQL est démarré :
```bash
# Windows
pg_isready -h localhost -p 5432

# Ou Docker
docker ps | grep postgres
```

2. Testez la connexion :
```bash
psql $DATABASE_URL -c "SELECT 1"
```

3. Créez la DB si elle n'existe pas :
```bash
psql -U postgres -c "CREATE DATABASE corrigo;"
```

4. Mettez à jour `DATABASE_URL` dans `.env.local` :
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/corrigo
```

---

### ❌ Erreur: "Cannot find module './dist/index.mjs'"

**Cause** : Le build n'a pas généré les fichiers compilés.

**Solution** :
```bash
pnpm -C artifacts/api-server run build

# Vérifier si dist/ a été créé
ls artifacts/api-server/dist/
```

---

### ❌ Erreur 500: "Internal Server Error"

**Cause** : Une erreur non capturée dans l'API.

**Solution** :

1. Vérifiez les logs du serveur :
```bash
pnpm -C artifacts/api-server dev
# Les erreurs apparaissent dans le terminal
```

2. Activez les logs détaillés via `pino` :
```env
LOG_LEVEL=debug
```

3. Vérifiez les middlewares CORS, auth, validation

---

## 📱 Problèmes Mobile (Expo)

### ❌ "Module not found in /smartgrader"

**Cause** : Dépendances manquantes pour React Native.

**Solution** :
```bash
pnpm -C artifacts/smartgrader install

# Nettoyer le cache Expo
pnpm -C artifacts/smartgrader exec expo prebuild --clean
```

---

### ❌ "QR code won't scan"

**Cause** : L'app Expo n'est pas connectée au tunnel.

**Solutions** :

1. Lancez le serveur Expo correctement :
```bash
pnpm -C artifacts/smartgrader dev
```

2. Installez l'app Expo Go sur votre téléphone

3. Scannez le code QR affiché dans le terminal

4. Si ça persiste, utilisez `--localhost` :
```bash
pnpm -C artifacts/smartgrader dev -- --localhost
```

---

## 🔍 Problèmes Généraux

### ❌ Git status montre tous les fichiers modifiés

**Cause** : Line endings CRLF vs LF (Windows vs Unix).

**Solution** :
```bash
# Configurer Git
git config core.autocrlf true

# Ou réinitialiser le repo
git reset --hard HEAD
```

---

### ❌ "Port already in use"

**Cause** : Quelque chose d'autre utilise le port 5000 ou 5173.

**Solutions** :

1. **Vérifier quel processus utilise le port** (Windows) :
```bash
netstat -ano | findstr :5173
# Puis tuer le processus
taskkill /PID <PID> /F
```

2. **Utiliser un port différent** :
```bash
PORT=5174 pnpm -C artifacts/api-server dev
```

---

### ❌ "Cannot access node_modules"

**Cause** : Problème de permissions ou fichiers verrouillés.

**Solution** :
```bash
# Fermer tous les programmes utilisant node_modules

# Supprimer et réinstaller
rm -r node_modules
pnpm install

# Ou relancer VS Code
```

---

### ❌ TypeScript errors avec "Cannot find type definition"

**Cause** : Types TypeScript manquants ou incorrects.

**Solution** :
```bash
# Vérifier les types
pnpm typecheck

# Ajouter les types manquants
pnpm add -D @types/nom-package

# Ou configurer tsconfig.json
```

---

## 🚀 Problèmes de Performance

### ❌ Le dev server est lent

**Solutions** :

1. Réduisez le watch des fichiers :
```bash
# Vite config
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/node_modules/**']
    }
  }
});
```

2. Utilisez un disque SSD (pas sur le réseau)

3. Fermez les autres applications gourmandes en ressources

4. Vérifiez les logs de compilation :
```bash
pnpm -C artifacts/mockup-sandbox dev -- --debug
```

---

### ❌ Build trop lent

**Solutions** :

1. Utilisez esbuild pour le bundling

2. Vérifiez les imports récursifs ou circulaires :
```bash
pnpm dlx madge --circular artifacts/api-server/src
```

---

## 💡 Tips de Debug

### Logger les variables d'env
```bash
# Afficher toutes les env vars
env | grep -i corrigo
# ou
env | findstr corrigo  # Windows
```

### Démarrer un debug REPL
```bash
node --inspect ./dist/index.mjs
# Visitez chrome://inspect
```

### Tracer les imports
```bash
node --trace-imports ./src/main.ts 2>&1 | head -50
```

---

## 📞 Besoin d'Aide ?

1. **Vérifiez ce guide** (Ctrl+F pour chercher)
2. **Consultez les [Issues](https://github.com/Mardo-k12/Corrigo/issues)**
3. **Ouvrez une nouvelle issue** avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Logs/erreurs exactes
   - Votre environnement (Node version, OS, etc.)

---

**Bonne chance ! 🍀** Si vous trouvez une solution à un problème, contribuez ce guide !
