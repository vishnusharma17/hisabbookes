import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../auth/auth.middleware";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.schemas";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "./customer.service";

export const customerRouter = Router();

customerRouter.use(requireAuth);

function getUserId(req: AuthenticatedRequest) {
  return req.userId;
}

customerRouter.post("/businesses/:businessId/customers", async (req, res) => {
  const userId = getUserId(req as AuthenticatedRequest);

  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  const parsed = createCustomerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      details: parsed.error.flatten(),
    });
  }

  try {
    const customer = await createCustomer(
      userId,
      req.params.businessId,
      parsed.data,
    );

    return res.status(201).json({ customer });
  } catch (error) {
    if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
    }

    console.error("Create customer error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

customerRouter.get("/businesses/:businessId/customers", async (req, res) => {
  const userId = getUserId(req as AuthenticatedRequest);

  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    const customers = await listCustomers(userId, req.params.businessId);
    return res.status(200).json({ customers });
  } catch (error) {
    if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
    }

    console.error("List customers error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

customerRouter.get(
  "/businesses/:businessId/customers/:customerId",
  async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);

    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const customer = await getCustomer(
        userId,
        req.params.businessId,
        req.params.customerId,
      );

      if (!customer) {
        return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });
      }

      return res.status(200).json({ customer });
    } catch (error) {
      if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }

      console.error("Get customer error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);

customerRouter.patch(
  "/businesses/:businessId/customers/:customerId",
  async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);

    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    const parsed = updateCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        details: parsed.error.flatten(),
      });
    }

    try {
      const customer = await updateCustomer(
        userId,
        req.params.businessId,
        req.params.customerId,
        parsed.data,
      );

      return res.status(200).json({ customer });
    } catch (error) {
      if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }

      if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
        return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });
      }

      console.error("Update customer error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);

customerRouter.delete(
  "/businesses/:businessId/customers/:customerId",
  async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);

    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      await deleteCustomer(
        userId,
        req.params.businessId,
        req.params.customerId,
      );

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }

      if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
        return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });
      }

      console.error("Delete customer error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
