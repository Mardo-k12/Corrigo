# 🤝 Guide de Contribution - Corrigo

Merci de vouloir contribuer à **Corrigo** ! Ce document vous guide à travers le processus de contribution.

---

## 📖 Code de Conduite

- **Respectueux** : Soyez courtois envers les autres contributeurs
- **Constructif** : Donnez des feedbacks utiles et constructifs
- **Inclusif** : Accueillez la diversité des perspectives et d'expériences

---

## 🎯 Types de Contributions

### 🐛 Signaler un Bug
1. Vérifiez si le bug n'existe pas déjà dans les [Issues](https://github.com/Mardo-k12/Corrigo/issues)
2. Créez une nouvelle issue avec le titre : `[BUG] Description brève`
3. Incluez :
   - La version de Node.js (`node --version`)
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs réel
   - Les captures d'écran/logs

### 💡 Suggérer une Fonctionnalité
1. Ouvrez une issue avec le titre : `[FEATURE] Description`
2. Expliquez :
   - Quel problème elle résout
   - Comment elle serait utilisée
   - Des alternatives envisagées
3. Attendez le feedback avant de commencer le développement

### 📚 Améliorer la Documentation
- Trouvez une typo ? → Faites un PR directement !
- Clarifier une partie ? → Proposez des changements
- Documentation manquante ? → Ouvrez une issue

### 💻 Coder une Feature

Continuez au **Workflow de Contribution** ci-dessous 👇

---

## 🔄 Workflow de Contribution

### 1️⃣ Fork et Clone

```bash
# Fork le dépôt sur GitHub
# Puis clone votre fork
git clone https://github.com/VOTRE_USERNAME/Corrigo.git
cd Corrigo
git remote add upstream https://github.com/Mardo-k12/Corrigo.git
```

### 2️⃣ Créer une branche

```bash
# Mettez à jour main
git fetch upstream
git checkout main
git merge upstream/main

# Créez une branche de feature
git checkout -b feat/nom-descriptif
# ou pour un bug fix
git checkout -b fix/nom-du-bug
```

**Convention de nommage des branches** :
- `feat/scanner-improvement` - Nouvelle feature
- `fix/auth-error` - Bug fix
- `docs/setup-guide` - Documentation
- `refactor/api-structure` - Refactoring
- `test/unit-tests` - Tests

### 3️⃣ Installer et Tester

```bash
pnpm install
pnpm typecheck    # Vérifier les types
pnpm lint         # Linter le code
pnpm test         # Lancer les tests (si présents)
```

### 4️⃣ Faire vos Changements

**Structure de fichiers** :
```
artifacts/
├── api-server/          # Backend Express
│   └── src/
│       ├── app.ts       # App principale
│       ├── routes/      # Endpoints API
│       └── lib/         # Utilitaires
├── mockup-sandbox/      # Frontend React
│   └── src/
│       ├── App.tsx      # Composant racine
│       ├── components/  # Composants UI
│       └── hooks/       # Hooks custom
└── smartgrader/         # App Mobile
    └── app/             # Écrans Expo Router

lib/
├── api-spec/            # Spec OpenAPI
├── api-client-react/    # Client API React Query
├── db/                  # Schéma Drizzle
└── integrations-gemini-ai/  # Client Gemini
```

**Bonnes pratiques** :
- ✅ Écrivez du code **type-safe** avec TypeScript
- ✅ Créez des **composants réutilisables**
- ✅ Utilisez les **hooks custom** pour la logique partagée
- ✅ **Commentez** le code complexe
- ✅ Écrivez des **tests** pour vos features
- ❌ N'oubliez pas les `.env` - utilisez `.env.example`

### 5️⃣ Commit et Push

```bash
# Commitez vos changements
git add .
git commit -m "feat: ajouter scanner OCR amélioré"

# Push vers votre fork
git push origin feat/nom-descriptif
```

**Convention de commit** (Conventional Commits) :
```
feat:     Nouvelle feature
fix:      Bug fix
docs:     Documentation
style:    Formatage, pas de changement logique
refactor: Refactoring sans changer la logique
test:     Ajouter/modifier des tests
ci:       Changements CI/CD
```

### 6️⃣ Créer une Pull Request

1. Allez sur [GitHub](https://github.com/Mardo-k12/Corrigo/pulls)
2. Cliquez sur **"New Pull Request"**
3. Sélectionnez `upstream main` ← `votre_fork feat/...`
4. Remplissez le template PR :

```markdown
## Description
Brève description de vos changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle feature
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] J'ai testé manuellement
- [ ] J'ai ajouté des tests
- [ ] Les tests existants passent

## Screenshots (si applicable)
[Collez les captures ici]

## Checklist
- [ ] Mon code suit le style du projet
- [ ] J'ai mis à jour la documentation
- [ ] J'ai supprimé les console.log() de debug
- [ ] Pas de dépendances inutiles
```

### 7️⃣ Code Review

Le mainteneur va :
- Revoir votre code
- Demander des clarifications si nécessaire
- Suggérer des améliorations

**Restez patient et courtois !** Les reviews prennent du temps. 🙂

### 8️⃣ Merge

Une fois approuvé, votre PR sera mergée par le mainteneur.

**Félicitations ! 🎉** Votre contribution fait partie de Corrigo !

---

## 📐 Standards de Code

### TypeScript
```typescript
// ✅ Bon
interface UserInput {
  email: string;
  password: string;
}

function registerUser(input: UserInput): Promise<User> {
  // Type-safe, clair, bien documenté
  return api.post('/auth/register', input);
}

// ❌ Mauvais
function register(data: any) {
  // any, pas documenté
  return api.post('/auth/register', data);
}
```

### React Components
```typescript
// ✅ Bon
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

// ❌ Mauvais
export function Button(props: any) {
  // Props type not defined
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### Commits et PRs
```bash
# ✅ Bon
git commit -m "feat: ajouter validation OCR avec Gemini Vision"
git commit -m "fix: corriger bug dans le calcul de la moyenne"

# ❌ Mauvais
git commit -m "update"
git commit -m "fixed things"
```

---

## 🧪 Tester votre Code

### Lancer les tests
```bash
# Tous les tests
pnpm test

# Tests spécifiques à un package
pnpm -C artifacts/api-server test

# Watch mode
pnpm test -- --watch
```

### Vérifier les types
```bash
pnpm typecheck
```

### Linter
```bash
pnpm lint

# Corriger automatiquement les erreurs
pnpm lint -- --fix
```

### Formater
```bash
pnpm format
```

---

## 📦 Dépendances

### Ajouter une dépendance
```bash
# À la root
pnpm add -w nom-package

# À un package spécifique
pnpm -C artifacts/api-server add express
```

### Règles
- ✅ Essayez de partager les dépendances via `lib/`
- ❌ N'ajoutez pas de dépendances inutiles
- ❌ Évitez les dépendances conflictuelles

---

## 🔐 Sécurité

- Ne commitez **JAMAIS** les fichiers `.env` ou les secrets
- Utilisez des **variables d'environnement** pour les configs sensibles
- Validez **toujours** les entrées utilisateur
- Utilisez **HTTPS** en production

---

## 📚 Ressources Utiles

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express Guide](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vite Guide](https://vitejs.dev/)

---

## ❓ Questions ?

- 💬 Ouvrez une [Discussion](https://github.com/Mardo-k12/Corrigo/discussions)
- 📧 Contactez le mainteneur
- 🐛 Consultez les [Issues existantes](https://github.com/Mardo-k12/Corrigo/issues)

---

**Merci de contribuer à Corrigo ! Votre travail aide des milliers d'enseignants.** 🚀
