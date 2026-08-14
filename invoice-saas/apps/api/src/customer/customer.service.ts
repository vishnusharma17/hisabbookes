import { prisma } from "../lib/prisma";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./customer.schemas";

async function ownedBusiness(userId: string, businessId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true },
  });
}

export async function createCustomer(
  userId: string,
  businessId: string,
  input: CreateCustomerInput,
) {
  const business = await ownedBusiness(userId, businessId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return prisma.customer.create({
    data: {
      businessId,
      ...input,
    },
  });
}

export async function listCustomers(userId: string, businessId: string) {
  const business = await ownedBusiness(userId, businessId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return prisma.customer.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomer(
  userId: string,
  businessId: string,
  customerId: string,
) {
  const business = await ownedBusiness(userId, businessId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return prisma.customer.findFirst({
    where: {
      id: customerId,
      businessId,
    },
  });
}

export async function updateCustomer(
  userId: string,
  businessId: string,
  customerId: string,
  input: UpdateCustomerInput,
) {
  const business = await ownedBusiness(userId, businessId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      businessId,
    },
    select: { id: true },
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  return prisma.customer.update({
    where: { id: customerId },
    data: input,
  });
}

export async function deleteCustomer(
  userId: string,
  businessId: string,
  customerId: string,
) {
  const business = await ownedBusiness(userId, businessId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      businessId,
    },
    select: { id: true },
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  await prisma.customer.delete({
    where: { id: customerId },
  });
}
