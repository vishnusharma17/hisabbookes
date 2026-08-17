import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { LoginInput, SignupInput } from "./auth.schemas";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET_MISSING_OR_TOO_SHORT");
  }
  return secret;
}

function createAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, getAuthSecret(), { expiresIn: "7d" });
}

export async function signup(input: SignupInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await argon2.hash(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    user,
    accessToken: createAccessToken(user.id),
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    },
    accessToken: createAccessToken(user.id),
  };
}
