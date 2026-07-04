# 📱 Corrigo – Correction de copies par IA

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-lightgrey)
![Status](https://img.shields.io/badge/status-beta-orange)

> **Corrigo** est une application mobile et web qui assiste les enseignants dans la correction automatique des copies d'examen.  
> Elle utilise l'intelligence artificielle (**Google Gemini Vision** + **Generative AI**) pour noter, commenter et générer des relevés en quelques secondes.  
> Développée dans le cadre d'un projet de fin d'année à l'**Université Protestante au Congo (UPC)**.

---

## 🎯 Problème résolu

Les enseignants passent des heures à corriger manuellement des copies – une tâche répétitive, source de fatigue et de subjectivité.  
Les étudiants reçoivent leurs résultats tardivement, ce qui freine leur progression.

**Corrigo** automatise cette tâche : l'enseignant scanne les copies, l'IA propose une note et un commentaire, et il ne reste qu'à valider ou ajuster.

---

## ✨ Fonctionnalités principales

- 🔐 **Authentification** – Connexion sécurisée des enseignants (email / mot de passe)
- 📚 **Gestion des cours** – Création et organisation des cours
- 📸 **Scan de copies** – Capture depuis appareil photo ou import depuis galerie
- 🤖 **Correction par IA** – Google Vision (OCR) → Gemini AI → note + feedback détaillé
- ✏️ **Ajustement manuel** – Modification possible avant validation
- 📊 **Tableau de bord** – Moyennes, statistiques, taux de réussite
- 📎 **Exports** – Relevé de notes PDF, données Excel
- 📱 **Multi-plateforme** – Web (React), Mobile (React Native/Expo)
- ⚡ **Temps réel** – Notifications et mise à jour en direct

---

## 🛠️ Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend Web** | React + Vite + Tailwind CSS + Shadcn/ui |
| **Frontend Mobile** | React Native + Expo |
| **Backend** | Node.js + Express + TypeScript |
| **Base de données** | PostgreSQL + Drizzle ORM |
| **API IA** | Google Generative AI + Vision API |
| **Validation** | Zod + TypeScript |
| **État** | React Query (TanStack Query) |
| **Authentification** | JWT (JSON Web Token) |
| **Monorepo** | pnpm workspaces |

---

## 🚀 Démarrage Rapide

### 1️⃣ Clone et Installation

```bash
git clone https://github.com/Mardo-k12/Corrigo.git
cd Corrigo
pnpm install
```

### 2️⃣ Configuration

Consultez [SETUP.md](./SETUP.md) pour :
- Configurer les APIs Google Cloud (Gemini + Vision)
- Configurer la base de données
- Définir les variables d'environnement

Si votre clone local date d'avant la réécriture d'historique du 2026-07-04, suivez d'abord [SECRET_ROTATION_AND_RECOVERY.md](./SECRET_ROTATION_AND_RECOVERY.md).

### 3️⃣ Lancer les services

```bash
# Terminal 1 - API Backend
pnpm -C artifacts/api-server dev

# Terminal 2 - Frontend Web
pnpm -C artifacts/mockup-sandbox dev

# Terminal 3 - App Mobile
pnpm -C artifacts/smartgrader dev
```

➜ **Web** : http://localhost:5173  
➜ **API** : http://localhost:5000  
➜ **Mobile** : Expo QR Code

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | 📋 Installation détaillée, configuration des APIs, démarrage |
| [SECRET_ROTATION_AND_RECOVERY.md](./SECRET_ROTATION_AND_RECOVERY.md) | 🔐 Rotation des secrets et reprise après réécriture git |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🏗️ Vue d'ensemble du projet, diagrammes, data flow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 🤝 Guide de contribution, standards de code |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 🔧 Solutions aux problèmes courants |

---

## 📁 Structure du Projet

```
Corrigo/
├── artifacts/
│   ├── api-server/        # Backend Node.js + Express
│   ├── mockup-sandbox/    # Frontend React + Vite
│   └── smartgrader/       # App Mobile React Native + Expo
├── lib/
│   ├── api-spec/          # Spec OpenAPI
│   ├── api-client-react/  # Client React Query généré
│   ├── api-zod/           # Validation Zod
│   ├── db/                # Schéma Drizzle ORM
│   └── integrations-gemini-ai/ # Client Google Gemini
└── scripts/               # Utilitaires
```

Consultez [ARCHITECTURE.md](./ARCHITECTURE.md) pour plus de détails.

---

## 🔄 Data Flow Principaux

**Correction d'Examen** :
1. Enseignant scanne une copie 📸
2. Image envoyée à l'API → Google Vision (OCR) 🤖
3. Texte extrait → Google Gemini AI (génère note + feedback)
4. Résultat sauvegardé en BD 💾
5. Enseignant valide ou ajuste ✅
6. Note finalisée 🎯

---

## 🎯 Roadmap

- ✅ Authentification JWT
- ✅ API REST complète
- ✅ Intégration Google Gemini + Vision
- ⏳ Génération d'examens par IA
- ⏳ Export PDF/Excel avancé
- ⏳ Notifications real-time (WebSocket)
- ⏳ Dashboard analytics complet
- ⏳ Support multi-langues

---

## 🤝 Contribuer

Les contributions sont bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour :
- Signaler un bug
- Proposer une feature
- Soumettre une PR

---

## 🆘 Besoin d'Aide ?

- 📖 Lire [SETUP.md](./SETUP.md) pour l'installation
- 🔧 Consulter [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) pour les problèmes
- 💬 Ouvrir une [Discussion](https://github.com/Mardo-k12/Corrigo/discussions)
- 🐛 Signaler un [Bug](https://github.com/Mardo-k12/Corrigo/issues)

---

## 👨‍🎓 Contexte Universitaire

Ce projet a été réalisé dans le cadre de la L2 Informatique à la Faculté des Sciences Informatiques (FASI) de l'Université Protestante au Congo (UPC) – Kinshasa.

**Encadrement** :
- Prof. MAMPUYA KINKANI Pescie
- Prof. KUTANGILA MAYOYA David

**Année académique** : 2025-2026

---

## 📄 Licence

MIT © 2025 Corrigo Project

Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## ✉️ Contact

- **Auteur** : Mardochée (Mardo-k12)
- **GitHub** : [@Mardo-k12](https://github.com/Mardo-k12)
- **Email** : mardocheekanushipi@gmail.com
