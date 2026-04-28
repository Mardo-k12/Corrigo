export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScore(score: number, max: number): string {
  const rounded = Math.round(score * 100) / 100;
  return `${rounded}/${max}`;
}

export function gradeColor(score: number, max: number): "success" | "warning" | "destructive" {
  const ratio = max > 0 ? score / max : 0;
  if (ratio >= 0.5) return "success";
  if (ratio >= 0.3) return "warning";
  return "destructive";
}

export function gradeLabel(score: number, max: number): string {
  const ratio = max > 0 ? score / max : 0;
  if (ratio >= 0.85) return "Excellent";
  if (ratio >= 0.7) return "Très bien";
  if (ratio >= 0.6) return "Bien";
  if (ratio >= 0.5) return "Satisfaisant";
  if (ratio >= 0.3) return "Insuffisant";
  return "Échec";
}
