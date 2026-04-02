import crypto from "crypto";
import { ethers } from "ethers";

const nonces = new Map(); // address -> { nonce, expiresAt }
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h
const NONCE_TTL_MS = 1000 * 60 * 10; // 10m

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signHmac(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function issueNonce(address) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + NONCE_TTL_MS;
  nonces.set(address.toLowerCase(), { nonce, expiresAt });
  return { nonce, expiresAt };
}

export function buildSiweLikeMessage({ address, nonce, chainId = 80002 }) {
  // Minimal, human-readable, hackathon-safe “sign-in” message.
  return [
    "Personal Data Economy Wallet",
    "",
    "Sign in to access your vault and marketplace actions.",
    "",
    `Address: ${address}`,
    `ChainId: ${chainId}`,
    `Nonce: ${nonce}`,
    `IssuedAt: ${new Date().toISOString()}`,
  ].join("\n");
}

export function verifySignedNonce({ address, signature, message }) {
  const recovered = ethers.verifyMessage(message, signature);
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    const err = new Error("Signature does not match address");
    err.code = "BAD_SIG";
    throw err;
  }

  const entry = nonces.get(address.toLowerCase());
  if (!entry) {
    const err = new Error("Nonce not found");
    err.code = "NO_NONCE";
    throw err;
  }
  if (Date.now() > entry.expiresAt) {
    nonces.delete(address.toLowerCase());
    const err = new Error("Nonce expired");
    err.code = "NONCE_EXPIRED";
    throw err;
  }
  if (!message.includes(`Nonce: ${entry.nonce}`)) {
    const err = new Error("Message nonce mismatch");
    err.code = "NONCE_MISMATCH";
    throw err;
  }

  // one-time nonce
  nonces.delete(address.toLowerCase());
  return true;
}

export function issueToken({ address }, secret) {
  const payload = {
    sub: address.toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = base64url(JSON.stringify(payload));
  const sig = signHmac(body, secret);
  return `${body}.${sig}`;
}

export function verifyToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = signHmac(body, secret);

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

