import { detectPii, redactPii } from "./pii.js";

export function privacyReport(category, payload) {
  const pii = detectPii(payload);
  const redacted = redactPii(payload);
  return {
    category: String(category || "unknown").toUpperCase(),
    pii,
    redactedPreview: typeof redacted === "string" ? redacted.slice(0, 800) : redacted,
  };
}

export function summarizeInsight(category, anonymized) {
  const c = String(category || "unknown").toUpperCase();
  const base = { category: c, safe: true };

  // Deterministic “AI-like” summary for demo; swap with real LLM later.
  if (anonymized && typeof anonymized === "object") {
    const keys = Object.keys(anonymized);
    const top = keys.slice(0, 6).map((k) => `${k}: ${String(anonymized[k]).slice(0, 60)}`);
    return {
      ...base,
      headline: `Anonymized ${c} insight ready`,
      bullets: top,
      note: "Aggregated insight only (no raw PII).",
    };
  }

  return { ...base, headline: `Anonymized ${c} insight ready`, bullets: [], note: "Aggregated insight only (no raw PII)." };
}

