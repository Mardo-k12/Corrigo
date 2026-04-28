const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = String(data.error);
      if (data?.details) message += `: ${data.details}`;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function aiOcr(imageBase64: string, mimeType = "image/jpeg"): Promise<string> {
  const data = await postJSON<{ text: string }>("/ai/ocr", { imageBase64, mimeType });
  return data.text ?? "";
}

export type GradeResult = {
  score: number;
  maxScore: number;
  appreciation: string;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
};

export async function aiGrade(input: {
  studentText: string;
  courseContent: string;
  courseTitle: string;
  maxScore: number;
  questionContext?: string;
}): Promise<GradeResult> {
  return postJSON<GradeResult>("/ai/grade", input);
}

export type GeneratedExam = {
  title: string;
  instructions: string;
  totalPoints: number;
  durationMinutes: number;
  questions: Array<{
    type: "qcm" | "ouvert";
    statement: string;
    points: number;
    options?: string[];
    answer?: string;
  }>;
};

export async function aiGenerateExam(input: {
  courseContent: string;
  courseTitle: string;
  numQuestions: number;
  difficulty: "facile" | "moyen" | "difficile";
  type: "qcm" | "ouvert" | "mixte";
}): Promise<GeneratedExam> {
  return postJSON<GeneratedExam>("/ai/generate-exam", input);
}

export async function aiSummarizeCourse(content: string, title: string): Promise<string> {
  const data = await postJSON<{ summary: string }>("/ai/summarize-course", { content, title });
  return data.summary ?? "";
}
