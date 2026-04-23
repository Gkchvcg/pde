import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createRequest, listRequests, getRequest, addContribution } from "../services/requests.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const companyAddress = req.user?.sub;
    const request = createRequest(companyAddress, req.body);
    res.status(201).json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    res.json(listRequests());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  const request = getRequest(req.params.id);
  if (!request) return res.status(404).json({ error: "Not found" });
  res.json(request);
});

router.post("/:id/contribute", requireAuth, async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return res.status(400).json({ error: "cid required" });
    const updated = addContribution(req.params.id, cid);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export { router as requestsRouter };
