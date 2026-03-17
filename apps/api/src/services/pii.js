function findAll(regex, text) {
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push({ match: m[0], index: m.index });
  }
  return matches;
}

export function detectPii(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);

  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const phone = /\b(\+?\d{1,3}[\s.-]?)?(\(?\d{2,3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/g;
  const aadhaarLike = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
  const creditCardLike = /\b(?:\d[ -]*?){13,19}\b/g;

  const findings = [
    ...findAll(email, text).map((f) => ({ type: "email", ...f })),
    ...findAll(phone, text).map((f) => ({ type: "phone", ...f })),
    ...findAll(aadhaarLike, text).map((f) => ({ type: "id", ...f })),
    ...findAll(creditCardLike, text).map((f) => ({ type: "financial", ...f })),
  ];

  const riskScore = Math.min(100, findings.length * 12);
  return { riskScore, findingsCount: findings.length, findings: findings.slice(0, 50) };
}

export function redactPii(value) {
  const asString = typeof value === "string" ? value : JSON.stringify(value);
  let redacted = asString;

  // order matters: email, phone, ids, cc
  redacted = redacted.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]");
  redacted = redacted.replace(/\b(\+?\d{1,3}[\s.-]?)?(\(?\d{2,3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/g, "[REDACTED_PHONE]");
  redacted = redacted.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "[REDACTED_ID]");
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,19}\b/g, "[REDACTED_FINANCIAL]");

  // attempt to parse back if original was object/json
  if (typeof value !== "string") {
    try {
      return JSON.parse(redacted);
    } catch {
      return { text: redacted };
    }
  }
  return redacted;
}

