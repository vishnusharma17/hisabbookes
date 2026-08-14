import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./auth/auth.routes";
import { businessRouter } from "./business/business.routes";
import { customerRouter } from "./customer/customer.routes";
import { invoiceRouter } from "./invoice/invoice.routes";
import { invoiceFinalizeRouter } from "./invoice/invoice.finalize-routes";
import { paymentRouter } from "./payment/payment.routes";
import { dashboardRouter } from "./dashboard/dashboard.routes";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/businesses", businessRouter);
app.use("/api/v1", customerRouter);
app.use("/api/v1", invoiceRouter);
app.use("/api/v1", invoiceFinalizeRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", dashboardRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "hisabbookes-api" });
});

app.get("/api/v1", (_req, res) => {
  res.json({ name: "HisabBookes API", version: "v1" });
});

app.listen(port, () => {
  console.log(`HisabBookes API listening on http://localhost:${port}`);
});
