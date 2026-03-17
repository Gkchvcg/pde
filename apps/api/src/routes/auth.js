import { Router } from "express";
import { buildSiweLikeMessage, issueNonce, issueToken, verifySignedNonce } from "../services/auth.js";

const router = Router();

router.post("/nonce", (req, res) => {
  const { address } = req.body || {};
  if (!address) return res.status(400).json({ error: "address required" });
  const { nonce, expiresAt } = issueNonce(address);
  const message = buildSiweLikeMessage({ address, nonce });
  res.json({ address, nonce, expiresAt, message });
});

router.post("/verify", (req, res) => {
  const { address, signature, message } = req.body || {};
  if (!address || !signature || !message) return res.status(400).json({ error: "address, signature, message required" });

  try {
    verifySignedNonce({ address, signature, message });
    const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
    const token = issueToken({ address }, secret);
    res.json({ ok: true, token, address: address.toLowerCase() });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

export { router as authRouter };

