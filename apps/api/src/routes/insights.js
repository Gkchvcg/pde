import { Router } from "express";
import { getByCid } from "../services/storage.js";
import { requireAuth } from "../middleware/auth.js";
import { canViewCid } from "../services/chain.js";

const router = Router();

// Deliver anonymized insight (CID from smart contract fulfillment)
router.get("/:cid", requireAuth, async (req, res) => {
  const record = await getByCid(req.params.cid);
  if (!record) return res.status(404).json({ error: "Insight not found" });

  // Owner can view their own stored insights.
  const requesterAddress = req.user?.sub;
  if (record.owner !== requesterAddress?.toLowerCase()) {
    const requestId = req.query.requestId;
    const ok = await canViewCid({ requesterAddress, requestId, cid: req.params.cid });
    if (!ok.ok) return res.status(403).json({ error: "Forbidden", reason: ok.reason });
  }

  res.json(record.data);
});

export { router as insightsRouter };
