import { Router, type IRouter, type Request, type Response } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

const MODEL_TEXT = "gemini-2.5-flash";
const MODEL_VISION = "gemini-2.5-flash";

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

router.post("/ai/ocr", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body ?? {};
    if (typeof imageBase64 !== "string" || !imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }
    const safeMime = typeof mimeType === "string" && mimeType ? mimeType : "image/jpeg";

    const response = await ai.models.generateContent({
      model: MODEL_VISION,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Tu es un OCR expert. Extrais TOUT le texte manuscrit ou imprimé visible dans cette image de copie d'examen. Retourne UNIQUEMENT le texte brut, sans commentaire, sans formatage Markdown, en conservant les sauts de ligne pertinents. Si l'image ne contient pas de texte lisible, réponds par une chaîne vide.",
            },
            {
              inlineData: {
                mimeType: safeMime,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: { maxOutputTokens: 8192 },
    });

    const text = (response.text ?? "").trim();
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "OCR failed");
    res.status(500).json({ error: "OCR failed", details: String(err) });
  }
});

router.post("/ai/grade", async (req: Request, res: Response) => {
  try {
    const { studentText, courseContent, courseTitle, maxScore, questionContext } = req.body ?? {};
    if (typeof studentText !== "string" || !studentText.trim()) {
      res.status(400).json({ error: "studentText is required" });
      return;
    }
    const max = Number(maxScore) || 20;

    const prompt = `Tu es un professeur d'université expérimenté à l'UPC (RDC). Tu dois corriger une copie d'examen.

COURS: ${typeof courseTitle === "string" ? courseTitle : "Non spécifié"}
CONTENU DU COURS / RÉFÉRENCE:
${typeof courseContent === "string" ? courseContent.slice(0, 8000) : "Non fourni"}

${typeof questionContext === "string" && questionContext ? `CONTEXTE / QUESTIONS DE L'EXAMEN:\n${questionContext.slice(0, 4000)}\n` : ""}
COPIE DE L'ÉTUDIANT (texte extrait par OCR):
"""
${studentText.slice(0, 8000)}
"""

Évalue cette copie de manière rigoureuse, équitable et bienveillante. Retourne UNIQUEMENT un objet JSON valide (sans Markdown, sans \`\`\`) au format exact suivant :
{
  "score": <nombre entre 0 et ${max}, peut être décimal>,
  "maxScore": ${max},
  "appreciation": "<2-4 phrases résumant les forces et faiblesses>",
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "weaknesses": ["<faiblesse 1>", "<faiblesse 2>"],
  "suggestion": "<correction détaillée et conseils pour s'améliorer, 3-6 phrases>"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const raw = response.text ?? "";
    const parsed = extractJson(raw) as Record<string, unknown>;

    const score = Math.max(0, Math.min(max, Number(parsed.score) || 0));
    const result = {
      score,
      maxScore: max,
      appreciation: typeof parsed.appreciation === "string" ? parsed.appreciation : "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
      suggestion: typeof parsed.suggestion === "string" ? parsed.suggestion : "",
    };
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Grading failed");
    res.status(500).json({ error: "Grading failed", details: String(err) });
  }
});

router.post("/ai/generate-exam", async (req: Request, res: Response) => {
  try {
    const { courseContent, courseTitle, numQuestions, difficulty, type } = req.body ?? {};
    if (typeof courseContent !== "string" || !courseContent.trim()) {
      res.status(400).json({ error: "courseContent is required" });
      return;
    }
    const n = Math.max(1, Math.min(30, Number(numQuestions) || 10));
    const lvl = ["facile", "moyen", "difficile"].includes(String(difficulty))
      ? String(difficulty)
      : "moyen";
    const examType = ["qcm", "ouvert", "mixte"].includes(String(type)) ? String(type) : "mixte";

    const prompt = `Tu es un professeur d'université à l'UPC (RDC) qui prépare un examen.

COURS: ${typeof courseTitle === "string" ? courseTitle : "Non spécifié"}
CONTENU DU COURS:
${courseContent.slice(0, 12000)}

Génère un sujet d'examen avec EXACTEMENT ${n} questions, niveau "${lvl}", type "${examType}".
- Type "qcm" = uniquement questions à choix multiples (4 options, 1 bonne réponse).
- Type "ouvert" = uniquement questions ouvertes / dissertation.
- Type "mixte" = environ moitié QCM, moitié ouvertes.

Le barème total doit être 20 points, réparti judicieusement entre les questions.

Retourne UNIQUEMENT un objet JSON valide (pas de Markdown, pas de \`\`\`) au format :
{
  "title": "<titre court de l'examen>",
  "instructions": "<consignes générales pour les étudiants, 1-2 phrases>",
  "totalPoints": 20,
  "durationMinutes": <durée recommandée en minutes>,
  "questions": [
    {
      "type": "qcm" | "ouvert",
      "statement": "<énoncé de la question>",
      "points": <nombre>,
      "options": ["A", "B", "C", "D"],   // uniquement si type=qcm
      "answer": "<réponse correcte ou éléments attendus>"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const raw = response.text ?? "";
    const parsed = extractJson(raw) as Record<string, unknown>;
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Exam generation failed");
    res.status(500).json({ error: "Exam generation failed", details: String(err) });
  }
});

router.post("/ai/summarize-course", async (req: Request, res: Response) => {
  try {
    const { content, title } = req.body ?? {};
    if (typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const prompt = `Voici le contenu d'un cours universitaire intitulé "${typeof title === "string" ? title : "Sans titre"}". Résume-le en 5 à 10 points clés clairs et pédagogiques pour faciliter la correction des copies. Retourne uniquement le résumé textuel, sans Markdown.

CONTENU:
${content.slice(0, 15000)}`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 2048 },
    });

    res.json({ summary: (response.text ?? "").trim() });
  } catch (err) {
    req.log.error({ err }, "Summarize failed");
    res.status(500).json({ error: "Summarize failed", details: String(err) });
  }
});

export default router;
