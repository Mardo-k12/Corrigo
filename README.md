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
│   └── corrigo/           # App Mobile React Native + Expo
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


![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-lightgrey)
![Status](https://img.shields.io/badge/status-beta-orange)

> **Corrigo** est une application mobile et web qui assiste les enseignants dans la correction automatique des copies d’examen.  
> Elle utilise l’intelligence artificielle (reconnaissance de texte + GPT) pour noter, commenter et générer des relevés en quelques secondes.  
> Développée dans le cadre d’un projet de fin d’année à l’**Université Protestante au Congo (UPC)**.

---

## 🎯 Problème résolu

Les enseignants passent des heures à corriger manuellement des copies – une tâche répétitive, source de fatigue et de subjectivité.  
Les étudiants reçoivent leurs résultats tardivement, ce qui freine leur progression.

**Corrigo** automatise cette tâche : l’enseignant scanne les copies, l’IA propose une note et un commentaire, et il ne reste qu’à valider ou ajuster.

---

## ✨ Fonctionnalités principales

- 🔐 **Authentification** – Connexion sécurisée des enseignants (email / mot de passe)
- 📚 **Gestion des cours** – Import de PDF, extraction du texte source
- 📸 **Scan de copies** – Appareil photo ou import depuis la galerie, traitement par lot
- 🤖 **Correction par IA** – Google Vision (OCR) → OpenAI GPT → note + commentaire
- ✏️ **Ajustement manuel** – Modification possible avant validation
- 📝 **Génération d’examen** – Paramètres (type, difficulté, nombre de questions) → export PDF
- 📊 **Tableau de bord** – Moyennes, histogrammes, taux de réussite
- 📎 **Exports** – Relevé de notes PDF, bulletin Excel, historique des corrections
- 📱 **Responsive** – Fonctionne sur mobile, tablette et ordinateur

---

## 🛠️ Stack technique

| Domaine         | Technologies                                                |
|----------------|-------------------------------------------------------------|
| Frontend       | React / Next.js, Tailwind CSS                               |
| Backend        | Node.js + Express (ou PHP)                                  |
| Base de données| PostgreSQL / MySQL                                          |
| OCR            | Google Cloud Vision API                                     |
| IA générative  | OpenAI GPT-4 (ou GPT-3.5 Turbo)                             |
| Génération PDF | jsPDF / PDFKit                                              |
| Export Excel   | SheetJS (xlsx)                                              |
| Authentification | JWT (JSON Web Token)                                      |

---

## 🚀 Installation en local

### Prérequis

- Node.js 18+ (ou PHP 8+ selon le backend choisi)
- PostgreSQL / MySQL
- Comptes API : [Google Cloud Vision](https://cloud.google.com/vision) et [OpenAI](https://openai.com)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Mardo-k12/Corrigo.git
cd Corrigo

# 2. Installer les dépendances (frontend + backend)
npm install
cd frontend && npm install
cd ../backend && npm install

# 3. Configurer les variables d’environnement
cp .env.example .env
# Éditer .env avec vos clés API et informations de base de données

# 4. Lancer les serveurs de développement
npm run dev          # lance frontend + backend simultanément
# Ou séparément :
cd frontend && npm start   # http://localhost:3000
cd backend && npm run dev  # http://localhost:5000
💡 Pour le backend PHP : placez les fichiers dans un serveur Apache, importez la base de données database.sql et renseignez les clés dans config.php.

📸 Aperçu
(Ajoute ici des captures d’écran de l’application sur mobile et desktop)

Connexion	Scan de copie	Résultat de correction
https://via.placeholder.com/300x600?text=Login	https://via.placeholder.com/300x600?text=Scan	https://via.placeholder.com/300x600?text=Note
🧪 Utilisation (guide rapide)
Créer un compte enseignant.

Importer un cours (PDF) – le texte est extrait automatiquement.

Ajouter des étudiants (manuellement ou via CSV).

Scanner des copies : prenez en photo les copies manuscrites.

Lancer la correction : l’IA traite chaque image et affiche les notes.

Valider / ajuster les notes proposées.

Générer un relevé (PDF ou Excel) et le partager.

Créer un examen : l’IA génère un sujet personnalisé à partir du cours.

⚠️ Limites actuelles
L’OCR fonctionne moins bien sur une écriture très désordonnée ou des photos de mauvaise qualité.

L’IA (GPT) peut parfois mal interpréter des réponses hors contexte ou trop ambiguës.

La génération d’examen est limitée par la taille et la qualité du PDF source.

Aucune correction hors ligne pour l’instant (nécessite une connexion internet pour les API).

🔮 Perspectives d’amélioration
Version hors ligne partielle (Tesseract local + modèle IA léger)

Correction de copies de code (programmation)

Intégration avec Moodle / autres ENT

Mode collaboratif (plusieurs professeurs sur un même cours)

Application mobile native (React Native ou Flutter)

👨‍🎓 Contexte universitaire
Ce projet a été réalisé dans le cadre de la L2 Informatique à la Faculté des Sciences Informatiques (FASI) de l’Université Protestante au Congo (UPC) – Kinshasa.

Encadrement :

Prof. MAMPUYA KINKANI Pescie

Prof. KUTANGILA MAYOYA David

Année académique : 2025-2026

📄 Licence
Ce projet est sous licence MIT. Vous êtes libre de l’utiliser, de le modifier et de le distribuer.
Voir le fichier LICENSE pour plus de détails.

✉️ Contact
Auteur : Mardochée (Mardo-k12)

GitHub : @Mardo-k12

Email : mardocheekanushipi@gmail.com

UPC – Kinshasa, RDC

🙏 Remerciements
Aux professeurs et assistants de l’UPC pour leurs conseils et la philosophie du « 70% par soi-même ».

À la communauté open source pour les bibliothèques utilisées.

Aux testeurs (camarades de promo) qui ont fourni leurs copies manuscrites.

⭐ Si ce projet vous est utile, n’hésitez pas à mettre une étoile sur GitHub !
