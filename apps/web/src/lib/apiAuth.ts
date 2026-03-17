import { isHex } from "viem";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "pde-api-token";

type TokenStore = Record<string, string>;

function loadTokens(): TokenStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTokens(tokens: TokenStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function getApiToken(address?: string) {
  if (!address) return null;
  const tokens = loadTokens();
  return tokens[address.toLowerCase()] || null;
}

export function setApiToken(address: string, token: string) {
  const tokens = loadTokens();
  tokens[address.toLowerCase()] = token;
  saveTokens(tokens);
}

export async function getNonceMessage(address: string) {
  const res = await fetch(`${API}/api/auth/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error("Failed to get nonce");
  return res.json() as Promise<{ message: string; nonce: string; expiresAt: number }>;
}

export async function verifySignature(address: string, signature: string, message: string) {
  const res = await fetch(`${API}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature, message }),
  });
  if (!res.ok) throw new Error("Failed to verify signature");
  return res.json() as Promise<{ ok: true; token: string }>;
}

export function withAuthHeaders(token: string | null, headers: Record<string, string> = {}) {
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

export function isValidAddress(v?: string) {
  return Boolean(v && isHex(v));
}

