import { mockDeep, mockReset, MockProxy } from "jest-mock-extended";
import { prisma as prismaClient } from "../prismaClient";
import { PrismaClient } from "@xgovformbuilder/queueModel";

jest.mock("../prismaClient", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaClient);
});

export const prisma = (prismaClient as unknown) as MockProxy<PrismaClient>;
