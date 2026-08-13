import { Router } from "express";
import { signupSchema } from "./auth.schemas";
import { signup } from "./auth.service";

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
    const user = await signup(parsed.data);

    return res.status(201).json({
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        error: "USER_ALREADY_EXISTS",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});
