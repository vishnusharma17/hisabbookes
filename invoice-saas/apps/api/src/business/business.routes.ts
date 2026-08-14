import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../auth/auth.middleware";
import { createBusinessSchema, updateBusinessSchema } from "./business.schemas";
import { createBusiness, getBusiness, listBusinesses, updateBusiness } from "./business.service";

export const businessRouter = Router();
businessRouter.use(requireAuth);

businessRouter.post("/", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });
  const parsed = createBusinessSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT", details: parsed.error.flatten() });
  try {
    return res.status(201).json({ business: await createBusiness(userId, parsed.data) });
  } catch (error) {
    console.error("Create business error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

businessRouter.get("/", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });
  try {
    return res.status(200).json({ businesses: await listBusinesses(userId) });
  } catch (error) {
    console.error("List businesses error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

businessRouter.get("/:businessId", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });
  const business = await getBusiness(userId, req.params.businessId);
  if (!business) return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
  return res.status(200).json({ business });
});

businessRouter.patch("/:businessId", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });
  const parsed = updateBusinessSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT", details: parsed.error.flatten() });
  try {
    return res.status(200).json({ business: await updateBusiness(userId, req.params.businessId, parsed.data) });
  } catch (error) {
    if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
    }
    console.error("Update business error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});
