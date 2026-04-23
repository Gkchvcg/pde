import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { didRouter } from "./routes/did.js";
import { dataRouter } from "./routes/data.js";
import { insightsRouter } from "./routes/insights.js";
import { pricingRouter } from "./routes/pricing.js";
import { requestsRouter } from "./routes/requests.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/did", didRouter);
app.use("/api/data", dataRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/requests", requestsRouter);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.get("/", (_, res) =>
  res.json({
    name: "Personal Data Economy Wallet API",
    docs: "http://localhost:4000/api",
    endpoints: {
      health: "GET /api/health",
      did: "POST /api/did/create, GET /api/did/:address",
      data: "POST /api/data/upload, GET /api/data/vault/:address",
      insights: "GET /api/insights/:cid",
      pricing: "GET /api/pricing/estimate?category=..., GET /api/pricing/all",
    },
  })
);

const server = app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Free it with:\n  kill -9 $(lsof -t -i:${PORT})\n`);
    process.exit(1);
  }
  throw err;
});
