# 🏗️ Architecture - Corrigo

Vue d'ensemble complète de l'architecture de **Corrigo**.

---

## 📊 Diagramme d'Architecture Global

```mermaid
graph TB
    User["👥 User"]
    Browser["🌐 Browser"]
    Mobile["📱 Mobile App"]
    
    User -->|"HTTP/HTTPS"| Browser
    User -->|"Expo QR"| Mobile
    
    Browser -->|"REST API"| APIServer
    Mobile -->|"REST API"| APIServer
    
    APIServer["⚙️ API Server<br/>Node.js + Express"]
    
    APIServer -->|"Queries/Mutations"| DB["🗄️ PostgreSQL Database"]
    APIServer -->|"OAuth 2.0"| GeminiAI["🤖 Google Gemini AI<br/>Vision API<br/>Generative API"]
    APIServer -->|"JWT Auth"| Redis["📦 Redis Cache<br/>(Optional)"]
    
    subgraph "Frontend Applications"
        FrontendWeb["🎨 Mockup Sandbox<br/>React + Vite + Tailwind"]
        MobileApp["📱 CORRIGO<br/>React Native + Expo"]
    end
    
    subgraph "Shared Libraries"
        APISpec["📋 API Spec<br/>OpenAPI/Swagger"]
        APIClient["🔌 API Client<br/>React Query"]
        APIZod["✔️ API Zod<br/>Type Validation"]
        DBLib["🗄️ DB Library<br/>Drizzle ORM"]
        GeminiClient["🤖 Gemini Client<br/>Integration Layer"]
    end
    
    subgraph "Backend Services"
        APIServer
    end
    
    Browser -.->|"Imports"| FrontendWeb
    Mobile -.->|"Imports"| MobileApp
    
    FrontendWeb -.->|"Uses"| APIClient
    MobileApp -.->|"Uses"| APIClient
    
    APIClient -.->|"Validates"| APIZod
    APIServer -.->|"Uses"| DBLib
    APIServer -.->|"Uses"| GeminiClient
    APIServer -.->|"References"| APISpec
    
    GeminiClient -.->|"Calls"| GeminiAI
    DBLib -.->|"Queries"| DB
```

---

## 🏢 Structure des Dossiers

```
Corrigo/
├── artifacts/                 # Applications déployables
│   ├── api-server/           # Backend principal
│   │   ├── src/
│   │   │   ├── app.ts        # Configuration Express
│   │   │   ├── index.ts      # Point d'entrée
│   │   │   ├── routes/       # Endpoints API
│   │   │   │   ├── auth.ts   # Authentification
│   │   │   │   ├── courses.ts # Gestion des cours
│   │   │   │   ├── exams.ts  # Correction des examens
│   │   │   │   ├── ai.ts     # Endpoints IA
│   │   │   │   └── health.ts # Health check
│   │   │   ├── middlewares/  # Express middlewares
│   │   │   └── lib/
│   │   │       └── logger.ts # Pino logging
│   │   ├── build.mjs         # Build script (esbuild)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── mockup-sandbox/       # Frontend React
│   │   ├── src/
│   │   │   ├── App.tsx       # Composant racine
│   │   │   ├── main.tsx      # Entrée React
│   │   │   ├── index.css     # Styles globaux
│   │   │   ├── components/   # Composants réutilisables
│   │   │   │   └── ui/       # Shadcn UI components
│   │   │   ├── hooks/        # React hooks
│   │   │   └── lib/
│   │   │       └── utils.ts  # Utilitaires
│   │   ├── vite.config.ts    # Configuration Vite
│   │   └── tailwind.config.ts # Configuration Tailwind
│   │
│   └── corrigo/              # Mobile App (React Native)
│       ├── app/              # Expo Router screens
│       │   ├── (auth)/       # Écrans authentification
│       │   ├── (tabs)/       # Écrans principaux
│       │   ├── course/       # Détails course
│       │   ├── exam/         # Détails exam
│       │   └── grading/      # Correction
│       ├── components/       # Composants React Native
│       ├── contexts/         # Context API
│       │   ├── AuthContext.tsx
│       │   └── DataContext.tsx
│       ├── hooks/            # Hooks custom
│       ├── lib/              # Utilitaires
│       │   ├── api.ts        # Appels API
│       │   ├── storage.ts    # AsyncStorage
│       │   └── types.ts      # Types TypeScript
│       └── app.json          # Configuration Expo
│
├── lib/                       # Bibliothèques partagées (Monorepo)
│   ├── api-spec/             # Spécification API
│   │   ├── openapi.yaml      # Spec OpenAPI
│   │   └── orval.config.ts   # Config génération client
│   │
│   ├── api-client-react/     # Client API généré
│   │   ├── src/
│   │   │   ├── custom-fetch.ts
│   │   │   ├── index.ts
│   │   │   └── generated/    # Code généré par orval
│   │   └── package.json
│   │
│   ├── api-zod/              # Validation Zod schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/    # Schemas générés
│   │   └── package.json
│   │
│   ├── db/                   # Base de données
│   │   ├── src/
│   │   │   ├── index.ts      # Exports DB
│   │   │   └── schema/       # Drizzle schemas
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── integrations-gemini-ai/ # Client IA Gemini
│       ├── src/
│       │   ├── client.ts     # Client Gemini API
│       │   ├── index.ts
│       │   ├── batch/        # Batch operations
│       │   └── image/        # Image processing
│       └── package.json
│
├── scripts/                   # Utilitaires de build/deploy
├── pnpm-workspace.yaml       # Config monorepo
├── tsconfig.base.json        # Config TypeScript partagée
└── package.json              # Dépendances root
```

---

## 🔄 Data Flow - Correction d'Examen

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Mobile as CORRIGO
    participant API as API Server
    participant Vision as Google Vision API
    participant Gemini as Google Gemini AI
    participant DB as PostgreSQL
    
    User->>Mobile: 📸 Prend photo de la copie
    Mobile->>API: POST /exams/grade (image + rubric)
    API->>API: Valide la requête (Zod)
    API->>Vision: analyse l'image (OCR)
    Vision->>API: Retourne le texte extrait
    API->>Gemini: Génère la correction<br/>(texte + rubric)
    Gemini->>API: Note + Feedback
    API->>DB: Sauvegarde le résultat
    API->>Mobile: Retourne la note proposée
    Mobile->>User: 🎯 Affiche la correction
    User->>Mobile: ✅ Valide ou ✏️ Modifie
    Mobile->>API: PUT /exams/{id}/grade (final)
    API->>DB: Met à jour la DB
```

---

## 🗂️ Schéma Base de Données (Simplifié)

```mermaid
erDiagram
    USERS ||--o{ COURSES : teaches
    USERS ||--o{ EXAMS : creates
    COURSES ||--o{ EXAMS : has
    EXAMS ||--o{ STUDENT_EXAMS : contains
    STUDENTS ||--o{ STUDENT_EXAMS : takes
    STUDENT_EXAMS ||--o{ GRADES : has
    
    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string role "teacher|admin"
        timestamp created_at
    }
    
    COURSES {
        int id PK
        int teacher_id FK
        string name
        string description
        text rubric "Grading criteria"
        timestamp created_at
    }
    
    EXAMS {
        int id PK
        int course_id FK
        int created_by FK
        string title
        text description
        timestamp created_at
    }
    
    STUDENTS {
        int id PK
        int course_id FK
        string name
        string email
        timestamp created_at
    }
    
    STUDENT_EXAMS {
        int id PK
        int exam_id FK
        int student_id FK
        json scanned_images "OCR results"
        timestamp submitted_at
    }
    
    GRADES {
        int id PK
        int student_exam_id FK
        float score
        text feedback
        string status "proposed|validated|disputed"
        timestamp created_at
    }
```

---

## 🔐 Authentification & Autorisation

### Flow JWT

```mermaid
sequenceDiagram
    participant Client as Client App
    participant Server as API Server
    participant DB as PostgreSQL
    
    Client->>Server: POST /auth/login (email + password)
    Server->>DB: SELECT user WHERE email = ?
    DB->>Server: User data
    Server->>Server: Valider le hash du mot de passe
    alt Password correct
        Server->>Server: Générer JWT token
        Server->>Client: { accessToken, refreshToken }
        Client->>Client: Stocker token (localStorage/AsyncStorage)
    else Password incorrect
        Server->>Client: 401 Unauthorized
    end
    
    Note over Client: Requêtes suivantes
    Client->>Server: GET /exams<br/>Headers: Authorization: Bearer {token}
    Server->>Server: Vérifier JWT signature
    Server->>Server: Extraire user_id du token
    Server->>DB: SELECT * FROM exams WHERE teacher_id = ?
    DB->>Server: Exams data
    Server->>Client: 200 OK { exams }
```

### Modèle RBAC

```
Rôles:
├── teacher
│   ├── Créer/Éditer ses propres cours
│   ├── Créer/Éditer ses propres examens
│   ├── Valider les notes proposées
│   └── Exporter les résultats
│
├── admin
│   ├── Tous les droits du teacher
│   ├── Gérer les utilisateurs
│   └── Voir les statistiques
│
└── student
    ├── Voir ses notes
    ├── Télécharger ses résultats
    └── Contester une note
```

---

## 🚀 Déploiement Architecture

```mermaid
graph TB
    subgraph "Development"
        DevBrowser["🌐 localhost:5173"]
        DevMobile["📱 Expo localhost"]
        DevAPI["⚙️ localhost:5000"]
        DevDB["🗄️ Local PostgreSQL"]
    end
    
    subgraph "Production"
        CDN["📦 CDN<br/>Vercel/Netlify"]
        AppService["🖥️ Azure App Service<br/>Node.js"]
        RDS["🗄️ Azure Database<br/>PostgreSQL"]
        Storage["🗂️ Azure Blob Storage<br/>Images/PDFs"]
    end
    
    subgraph "CI/CD Pipeline"
        GitHub["🐙 GitHub"]
        Actions["⚙️ GitHub Actions"]
        Registry["📦 Container Registry"]
    end
    
    DevBrowser -->|"npm dev"| DevAPI
    DevMobile -->|"expo dev"| DevAPI
    DevAPI -->|"TypeORM"| DevDB
    
    GitHub -->|"Push"| Actions
    Actions -->|"Build & Test"| Registry
    Registry -->|"Deploy"| AppService
    AppService -->|"Connect"| RDS
    AppService -->|"Store files"| Storage
    CDN -->|"API calls"| AppService
```

---

## 🔌 Points d'Intégration Externe

### Google Cloud APIs

```
┌─────────────────────────────────────┐
│  Google Cloud Console               │
│  ├─ Generative Language API         │
│  │  └─ Base URL: generativelanguage.googleapis.com
│  ├─ Cloud Vision API                │
│  │  └─ Pour OCR (Vision)
│  └─ Docs API (future)               │
│     └─ Pour générer des PDFs
└─────────────────────────────────────┘
       ↑
       │ API Key
       ↓
┌─────────────────────────────────────┐
│  API Server                         │
│  └─ lib/integrations-gemini-ai     │
│     ├─ client.ts (initialisation)   │
│     ├─ batch/ (traitement par lot)  │
│     └─ image/ (vision)              │
└─────────────────────────────────────┘
```

---

## 📊 Stack Technique par Couche

| Couche | Technologies | Raison |
|--------|--------------|---------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS | Modern, performant, type-safe |
| **Mobile** | React Native, Expo | Code sharing avec le web |
| **Backend** | Node.js, Express, TypeScript | JavaScript partout, rapide |
| **Database** | PostgreSQL | Robust, relatif, scalable |
| **ORM** | Drizzle | Type-safe, moderne |
| **Validation** | Zod | Runtime validation + TypeScript |
| **API Generation** | Orval | Sync OpenAPI + Types |
| **State Management** | React Query | Sync serveur-client optimal |
| **Styling** | Tailwind CSS + Shadcn/ui | Composants réutilisables |
| **Build** | Vite, esbuild | Très rapide |
| **Logging** | Pino | Performance logging |
| **IA** | Google Gemini + Vision API | Accessible, puissant |

---

## 🔄 Workflow des Dépendances

```
pnpm-workspace.yaml
├─ Définit les workspace packages
└─ Définit les versions partagées (catalog)

lib/
├─ api-spec/
│  └─ Définit les types OpenAPI
├─ api-zod/
│  └─ Génère schemas Zod depuis OpenAPI
├─ api-client-react/
│  └─ Génère client React Query depuis OpenAPI
└─ db/
   └─ Definit le schéma Drizzle

artifacts/
├─ api-server
│  ├─ Dépend de: db, api-zod, integrations-gemini-ai
│  └─ Déploie: Node.js backend
├─ mockup-sandbox
│  ├─ Dépend de: api-client-react
│  └─ Déploie: React web
└─ corrigo
   ├─ Dépend de: api-client-react
   └─ Déploie: React Native mobile
```

---

## 🎯 Points d'Extension Futurs

### 1. Authentification OAuth 2.0
```typescript
// Remplacer JWT local par OAuth (Google, Microsoft)
- lib/auth-oauth/
```

### 2. Notifications Real-time
```typescript
// Ajouter WebSocket pour live updates
- Utiliser Socket.io ou ws
```

### 3. Batch Processing
```typescript
// Pour traiter plusieurs copies à la fois
- Bull Queue + Redis
```

### 4. Export Advanced
```typescript
// PDF, Excel, Google Classroom
- lib/export-suite/
```

### 5. Analytics Dashboard
```typescript
// Dashboard admin avec statistiques
- Utiliser Recharts + analytics SDK
```

---

## 📚 Ressources Supplémentaires

- [Architecture Decision Records (ADRs)](./docs/adr/) - Justifications des choix tech
- [API Documentation](./lib/api-spec/openapi.yaml) - Spec OpenAPI complète
- [Database Migrations](./lib/db/migrations/) - Historique des changements BD
- [Performance Guide](./docs/performance.md) - Optimisations et benchmarks

---

**Questions sur l'architecture ?** Ouvrez une [Discussion](https://github.com/Mardo-k12/Corrigo/discussions) ! 🚀
