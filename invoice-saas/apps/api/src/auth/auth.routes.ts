import { Router } from "express";
import { loginSchema, signupSchema } from "./auth.schemas";
import { login, signup } from "./auth.service";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      details: parsed.error.flatten(),
    });
  }

  try {
    const result = await signup(parsed.data);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({ error: "USER_ALREADY_EXISTS" });
    }

    if (
      error instanceof Error &&
      error.message === "AUTH_SECRET_MISSING_OR_TOO_SHORT"
    ) {
      return res.status(500).json({ error: "AUTH_NOT_CONFIGURED" });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      details: parsed.error.flatten(),
    });
  }

  try {
    const result = await login(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    if (
      error instanceof Error &&
      error.message === "AUTH_SECRET_MISSING_OR_TOO_SHORT"
    ) {
      return res.status(500).json({ error: "AUTH_NOT_CONFIGURED" });
    }

    console.error("Login error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});
