import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./auth/auth.routes";
const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "billflow-api" });
});

app.use("/api/v1/auth", authRouter);
app.get("/api/v1", (_req, res) => {
  res.json({ name: "BillFlow API", version: "v1" });
});

app.listen(port, () => {
  console.log(`BillFlow API listening on http://localhost:${port}`);
});
