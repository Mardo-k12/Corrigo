# 🚀 Guide de Setup Complet - Corrigo

Ce guide vous aide à configurer l'environnement de développement pour **Corrigo** en local.

---

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **pnpm** 10+ (`npm install -g pnpm`)
- **Git**
- Comptes API pour :
  - [Google Cloud Console](https://console.cloud.google.com/) - Vision API + Generative AI
  - Optionnel : OpenAI pour des tâches futures

---

## 1️⃣ Installation de Base

### Clone le dépôt
```bash
git clone https://github.com/Mardo-k12/Corrigo.git
cd Corrigo
```

### Installe les dépendances
```bash
pnpm install
```

Si vous venez de WSL ou Linux, il faut régénérer les binaires Windows :
```bash
rm pnpm-lock.yaml
pnpm install
```

---

## 2️⃣ Configuration des Variables d'Environnement

### Créer les fichiers `.env`

#### **API Server** - `artifacts/api-server/.env.local`
```env
# Gemini AI Configuration
AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
AI_INTEGRATIONS_GEMINI_API_KEY=your-google-api-key-here

# Database (optionnel en dev)
DATABASE_URL=postgresql://user:password@localhost:5432/corrigo

# Server
NODE_ENV=development
PORT=5000
```

#### **Frontend Mockup** - `artifacts/mockup-sandbox/.env.local`
```env
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:5000/api
```

#### **Mobile CORRIGO** - `artifacts/smartgrader/.env.local`
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-google-api-key-here
```

---

## 3️⃣ Configuration des APIs Google Cloud

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Select a Project"** → **"New Project"**
3. Nomme-le **"Corrigo"**
4. Attendez que le projet soit créé

### Étape 2 : Activer les APIs

1. Recherchez **"Vision API"** et activez-la
2. Recherchez **"Generative Language API"** (Gemini) et activez-la
3. Recherchez **"Docs API"** (optionnel pour générer des PDFs)

### Étape 3 : Créer une clé API

1. Allez sur **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"Create Credentials"** → **"API Key"**
3. Copiez la clé et mettez-la dans `.env.local` :
   ```env
  AI_INTEGRATIONS_GEMINI_API_KEY=your-gemini-api-key
   ```

> ⚠️ **Sécurité** : Ne commit pas le `.env.local` ! Ajoutez-le à `.gitignore`

---

## 4️⃣ Configuration de la Base de Données (Optionnel)

### Avec PostgreSQL Local

```bash
# Installer PostgreSQL
# https://www.postgresql.org/download/

# Créer une DB
psql -U postgres -c "CREATE DATABASE corrigo;"

# Mettre à jour DATABASE_URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/corrigo
```

### Avec Docker (Recommandé)

```bash
docker run -d \
  --name corrigo-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

Ensuite, migrez la DB :
```bash
pnpm -C lib/db run migrate
```

---

## 5️⃣ Lancer les Services

### 🌐 Frontend (React + Vite)
```bash
pnpm -C artifacts/mockup-sandbox dev
# → http://localhost:5173/
```

### ⚙️ Backend (Node.js + Express)
```bash
pnpm -C artifacts/api-server dev
# → http://localhost:5000/
```

### 📱 Mobile (Expo)
```bash
pnpm -C artifacts/smartgrader dev
# Scannez le QR code avec l'app Expo
```

### ▶️ Lancer tous les services en parallèle

**Terminal 1** :
```bash
pnpm -C artifacts/api-server dev
```

**Terminal 2** :
```bash
pnpm -C artifacts/mockup-sandbox dev
```

**Terminal 3** :
```bash
pnpm -C artifacts/smartgrader dev
```

---

## 6️⃣ Tester le Flow Complet

### 1. Authentification
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@upc.edu.cd",
    "password": "SecurePass123!",
    "fullName": "Teacher Name"
  }'
```

### 2. Créer un cours
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math 101",
    "description": "Basic Mathematics"
  }'
```

### 3. Scanner une copie (Test IA)
```bash
curl -X POST http://localhost:5000/api/exams/grade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@copy.jpg" \
  -F "courseId=course-123" \
  -F "rubric=Math rubric here"
```

---

## 7️⃣ Commands Utiles

```bash
# Vérifier les types TypeScript
pnpm typecheck

# Build toutes les applications
pnpm build

# Linter le code
pnpm lint

# Formater le code
pnpm format

# Supprimer les dépendances manquantes
pnpm prune
```

---

## ⚠️ Troubleshooting

### ❌ Erreur : "lightningcss.win32-x64-msvc.node not found"
**Solution** : Régénérez les binaires
```bash
rm pnpm-lock.yaml
pnpm install --force
```

### ❌ Erreur : "cross-env not found"
**Solution** : Ajoutez cross-env
```bash
pnpm add -D cross-env
```

### ❌ Erreur : "PORT environment variable is required"
**Solution** : Créez un `.env.local` avec `PORT=5173`

### ❌ La DB ne se connecte pas
**Solution** : Vérifiez la `DATABASE_URL` et assurez-vous que PostgreSQL est en cours d'exécution
```bash
# Test de connexion
psql $DATABASE_URL -c "SELECT 1"
```

---

## 🎯 Prochaines Étapes

1. **Lire** [CONTRIBUTING.md](./CONTRIBUTING.md) pour contribuer
2. **Explorer** [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre le projet
3. **Consulter** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) pour les problèmes courants

---

## 💡 Tips

- Utilisez **VS Code** avec les extensions :
  - **Prettier** - Formatage du code
  - **TypeScript Vue Plugin** - Support TypeScript dans les fichiers
  - **ESLint** - Linting
  
- Activez **Git Hooks** pour formatter automatiquement avant commit :
  ```bash
  npx husky install
  ```

- Testez votre code avec **Vitest** (si des tests existent) :
  ```bash
  pnpm test
  ```

---

**Besoin d'aide ?** Consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) ou ouvrez une issue ! 🚀
