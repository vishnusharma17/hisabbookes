import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../auth/auth.middleware";
import { getDashboardSummary } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/businesses/:businessId/dashboard",
  async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    try {
      const dashboard = await getDashboardSummary(
        userId,
        req.params.businessId,
      );

      return res.status(200).json({ dashboard });
    } catch (error) {
      if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }

      console.error("Dashboard error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
