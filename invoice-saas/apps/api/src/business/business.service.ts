import { prisma } from "../lib/prisma";
import type { CreateBusinessInput, UpdateBusinessInput } from "./business.schemas";

export async function createBusiness(userId: string, input: CreateBusinessInput) {
  return prisma.business.create({ data: { userId, ...input } });
}
export async function listBusinesses(userId: string) {
  return prisma.business.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}
export async function getBusiness(userId: string, businessId: string) {
  return prisma.business.findFirst({ where: { id: businessId, userId } });
}
export async function updateBusiness(userId: string, businessId: string, input: UpdateBusinessInput) {
  const existing = await prisma.business.findFirst({ where: { id: businessId, userId }, select: { id: true } });
  if (!existing) throw new Error("BUSINESS_NOT_FOUND");
  return prisma.business.update({ where: { id: businessId }, data: input });
}
