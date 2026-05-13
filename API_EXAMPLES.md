# 🧪 Exemples d'Utilisation de l'API Corrigo

Guide pratique pour tester les endpoints de l'API Corrigo avec cURL, Postman ou fetch.

---

## 🔑 Authentification

### 1. Register (Créer un compte)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@upc.edu.cd",
    "password": "SecurePass123!",
    "fullName": "Prof. Jean Dupont"
  }'
```

**Réponse** (200 OK) :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "email": "teacher@upc.edu.cd",
    "fullName": "Prof. Jean Dupont"
  }
}
```

### 2. Login (Se connecter)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@upc.edu.cd",
    "password": "SecurePass123!"
  }'
```

**Réponse** (200 OK) :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "email": "teacher@upc.edu.cd"
  }
}
```

**Stockez le token pour les requêtes suivantes** :
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📚 Gestion des Cours

### 1. Créer un cours

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathématiques L2",
    "description": "Calcul intégral et différentiel",
    "rubric": "- Compréhension des concepts (5pts)\n- Applications correctes (10pts)\n- Présentation (5pts)"
  }'
```

**Réponse** (201 Created) :
```json
{
  "id": "course-123",
  "name": "Mathématiques L2",
  "description": "Calcul intégral et différentiel",
  "teacherId": 1,
  "createdAt": "2025-05-13T10:30:00Z"
}
```

### 2. Récupérer tous les cours

```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse** (200 OK) :
```json
[
  {
    "id": "course-123",
    "name": "Mathématiques L2",
    "description": "Calcul intégral et différentiel",
    "students_count": 45,
    "exams_count": 2
  }
]
```

---

## 📝 Gestion des Examens

### 1. Créer un examen

```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-123",
    "title": "Contrôle Continu 1",
    "description": "Évaluation du chapitre 1 et 2",
    "totalPoints": 20,
    "durationMinutes": 120
  }'
```

**Réponse** (201 Created) :
```json
{
  "id": "exam-456",
  "courseId": "course-123",
  "title": "Contrôle Continu 1",
  "createdAt": "2025-05-13T11:00:00Z"
}
```

---

## 🤖 Endpoints IA Gemini

### 1. OCR - Extraire le texte d'une copie

**Préparation : Convertir l'image en Base64**

```bash
# Sur macOS/Linux
base64 -i copie.jpg > copie_base64.txt

# Sur Windows (PowerShell)
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("copie.jpg")) | Out-File copie_base64.txt
```

**Appel API** :
```bash
curl -X POST http://localhost:5000/api/ai/ocr \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "mimeType": "image/jpeg"
  }'
```

**Réponse** (200 OK) :
```json
{
  "text": "Question 1: Calculer l'intégrale de x²dx de 0 à 3\n\nRéponse:\nL'intégrale de x² est x³/3\nDe 0 à 3: (3³/3) - (0³/3) = 27/3 = 9"
}
```

### 2. Grade - Corriger une copie (IA Gemini)

```bash
curl -X POST http://localhost:5000/api/ai/grade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentText": "Question 1: Intégrale de x² de 0 à 3 = 9. Correct",
    "courseTitle": "Mathématiques L2",
    "courseContent": "Chapitre 1: Calcul intégral. L'intégrale de x^n = x^(n+1)/(n+1). Application: intégrale de x² = x³/3",
    "maxScore": 20,
    "questionContext": "Calculer l intégrale définie de x² entre 0 et 3. Justifier la réponse."
  }'
```

**Réponse** (200 OK) :
```json
{
  "score": 15,
  "maxScore": 20,
  "appreciation": "Très bonne compréhension du concept d'intégration. Les calculs sont corrects et bien justifiés.",
  "strengths": [
    "Application correcte de la formule d'intégration",
    "Calcul mathématique juste",
    "Raisonnement clair"
  ],
  "weaknesses": [
    "Notation un peu approximative"
  ],
  "suggestion": "Continuez sur cette lancée ! Pratiquez la notation mathématique formelle pour les prochains travaux."
}
```

### 3. Generate Exam - Générer un examen (IA Gemini)

```bash
curl -X POST http://localhost:5000/api/ai/generate-exam \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseTitle": "Mathématiques L2",
    "courseContent": "Calcul intégral: théorèmes fondamentaux, applications géométriques. Dérivées: théorème de Rolle, accroissements finis.",
    "numQuestions": 5,
    "difficulty": "moyen",
    "type": "mixte"
  }'
```

**Réponse** (200 OK) :
```json
{
  "title": "Examen Mathématiques L2 - Calcul Intégral et Dérivées",
  "instructions": "Répondez à toutes les questions. Vous disposez de 120 minutes. Justifiez vos réponses.",
  "totalPoints": 20,
  "durationMinutes": 120,
  "questions": [
    {
      "type": "qcm",
      "statement": "L'intégrale de cos(x) est:",
      "points": 2,
      "options": ["sin(x)", "-sin(x)", "sin(x) + C", "cos(x) + C"],
      "correctAnswer": "sin(x) + C"
    },
    {
      "type": "ouvert",
      "statement": "Énoncer et démontrer le théorème fondamental du calcul intégral.",
      "points": 8
    }
  ]
}
```

---

## 📊 Gestion des Notes

### 1. Soumettre une correction IA pour validation

```bash
curl -X POST http://localhost:5000/api/exams/exam-456/grades \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-789",
    "proposedScore": 15,
    "proposedFeedback": "Très bonne compréhension...",
    "status": "proposed"
  }'
```

### 2. Valider la note

```bash
curl -X PATCH http://localhost:5000/api/exams/exam-456/grades/grade-001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "finalScore": 15,
    "status": "validated"
  }'
```

---

## 💻 Exemple Complet en JavaScript/Fetch

```javascript
// Configuration
const API_BASE = 'http://localhost:5000/api';
let token = '';

// 1. Register & Login
async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teacher@upc.edu.cd',
      password: 'SecurePass123!'
    })
  });
  const data = await res.json();
  token = data.accessToken;
  console.log('✅ Connecté avec le token:', token);
}

// 2. Créer un cours
async function createCourse() {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Mathématiques L2',
      description: 'Calcul intégral',
      rubric: '- Concepts: 5pts\n- Applications: 10pts\n- Présentation: 5pts'
    })
  });
  const course = await res.json();
  console.log('✅ Cours créé:', course.id);
  return course.id;
}

// 3. Corriger une copie avec IA
async function gradeWithAI(courseId) {
  const studentText = `
    Question 1: Intégrale de x² de 0 à 3
    L'intégrale de x² est x³/3
    Limite supérieure: (3)³/3 = 27/3 = 9
    Limite inférieure: (0)³/3 = 0
    Résultat final: 9 - 0 = 9
  `;

  const res = await fetch(`${API_BASE}/ai/grade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentText,
      courseTitle: 'Mathématiques L2',
      courseContent: 'Chapitre sur l\'intégration...',
      maxScore: 20,
      questionContext: 'Calculer l\'intégrale définie de x² entre 0 et 3'
    })
  });
  const grade = await res.json();
  console.log('✅ Correction IA:', grade);
  return grade;
}

// Exécuter
async function main() {
  await login();
  const courseId = await createCourse();
  await gradeWithAI(courseId);
}

main().catch(console.error);
```

---

## 🧪 Tester avec Postman

### 1. Créer une Collection

1. Ouvrez **Postman**
2. Créez une nouvelle **Collection** : `Corrigo API`
3. Ajouter une **Variable** : `base_url` = `http://localhost:5000/api` et `token` = (laissez vide)

### 2. Importer les Endpoints

Créez des requêtes pour chaque endpoint dans la collection.

**Exemple : POST /auth/login**
- **URL** : `{{base_url}}/auth/login`
- **Body** (raw JSON) :
```json
{
  "email": "teacher@upc.edu.cd",
  "password": "SecurePass123!"
}
```
- **Script** (post-request) :
```javascript
if (pm.response.code === 200) {
  pm.environment.set('token', pm.response.json().accessToken);
}
```

### 3. Ajouter le Token aux Headers

Pour chaque requête protégée :
- **Authorization** : `Bearer {{token}}`

---

## 📞 Endpoints de Santé

### Health Check

```bash
curl http://localhost:5000/api/health
```

**Réponse** (200 OK) :
```json
{
  "status": "ok",
  "timestamp": "2025-05-13T12:00:00Z"
}
```

---

## 🚨 Codes d'Erreur Courants

| Code | Signification | Solution |
|------|---------------|----------|
| 400 | Bad Request | Vérifiez le format JSON, les champs requis |
| 401 | Unauthorized | Token manquant ou expiré, se reconnecter |
| 403 | Forbidden | Pas de permission pour cette ressource |
| 404 | Not Found | Ressource inexistante (courseId invalide ?) |
| 500 | Server Error | Erreur Gemini API - vérifier la clé API |

---

## 💡 Tips

1. **Tester localement** : Utilisez `localhost:5000` sans HTTPS en dev
2. **Sauvegarder le token** : Les tokens JWT expirent généralement après 24h
3. **Logs détaillés** : Activez `LOG_LEVEL=debug` dans `.env` pour plus d'infos
4. **Rate limiting** : L'API Gemini a des limites, tester progressivement

---

**Besoin d'aide ?** Consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 🚀
