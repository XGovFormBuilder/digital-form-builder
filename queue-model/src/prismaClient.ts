import logger from "pino";
import { Prisma, PrismaClient } from "@prisma/client";

const prismaLogger = logger();

const logLevel: Prisma.LogDefinition[] = [
  {
    emit: "event",
    level: "error",
  },
  {
    emit: "event",
    level: "warn",
  },
];

if (process.env.NODE_ENV === "development") {
  logLevel.push({
    emit: "event",
    level: "info",
  });
}

export const prisma: PrismaClient = new PrismaClient({
  log: logLevel,
});

prisma.$connect().catch((error) => {
  prismaLogger.error(`Prisma Connect Error ${error.message}`);
});

process.on("warn", (e) => {
  prismaLogger.warn(e);
});

process.on("info", (e) => {
  prismaLogger.info(e);
});

process.on("error", (e) => {
  prismaLogger.error(e);
});

process.on("beforeExit", () => {
  prismaLogger.info("Prisma is exiting");
});
