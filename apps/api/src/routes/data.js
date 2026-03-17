import { Router } from "express";
import multer from "multer";
import { storeEncrypted, storeMedia, getByCid } from "../services/storage.js";
import { anonymize } from "../services/anonymize.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

router.post("/upload", async (req, res) => {
  try {
    const { walletAddress, category, payload } = req.body;
    if (!walletAddress || !category || !payload) {
      return res.status(400).json({ error: "walletAddress, category, payload required" });
    }
    const anonymized = await anonymize(category, payload);
    const cid = await storeEncrypted(walletAddress, category, anonymized);
    res.json({ cid, category });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/upload-media", upload.single("file"), async (req, res) => {
  try {
    const { walletAddress, category } = req.body;
    if (!walletAddress || !category) {
      return res.status(400).json({ error: "walletAddress, category required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "file required" });
    }
    if (!/^image\/|^video\//.test(req.file.mimetype)) {
      return res.status(400).json({ error: "Only image/* and video/* are supported" });
    }

    const cid = await storeMedia(walletAddress, category, req.file);
    res.json({
      cid,
      category,
      mime: req.file.mimetype,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/media/:cid", async (req, res) => {
  try {
    const record = await getByCid(req.params.cid);
    if (!record) return res.status(404).json({ error: "Not found" });
    if (!record.data || record.data.kind !== "media") return res.status(400).json({ error: "CID is not media" });
    res.json({
      cid: req.params.cid,
      mime: record.data.mime,
      originalName: record.data.originalName,
      size: record.data.size,
      base64: record.data.base64,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/vault/:address", async (req, res) => {
  try {
    const list = await getByCid.listByOwner(req.params.address);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export { router as dataRouter };
