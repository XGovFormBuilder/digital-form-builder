import type { Prisma } from "@xgovformbuilder/queue-model";
import { PrismaClient } from "@xgovformbuilder/queue-model";
import config from "./config";
import logger from "pino";

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

if (config.isDev) {
  logLevel.push(
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "info",
    }
  );
}

export const prisma: PrismaClient = new PrismaClient({
  log: logLevel,
});

if (config.enableQueueService && config.queueType === "MYSQL") {
  prismaLogger.info(
    "ENABLE_QUEUE_SERVICE is true, and queueType is set to MYSQL connecting to Prisma"
  );
  prisma.$connect().catch((error) => {
    prismaLogger.fatal(
      `ENABLE_QUEUE_SERVICE is set to true, but Prisma failed to connect ${error}, exiting with status 1`
    );
    process.exit(1);
  });

  process.on("query", (e: Prisma.QueryEvent) => {
    if (!config.isTest) {
      prismaLogger.info(`
      Prisma Query: ${e.query} \r\n
      Duration: ${e.duration}ms \r\n
      Params: ${e.params}
    `);
    }
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
}
