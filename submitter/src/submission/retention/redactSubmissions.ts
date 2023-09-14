import config from "../../config";
import { prisma } from "../../prismaClient";
import { pino } from "pino";
import { R_ERRORS } from "./errors";
const logger = pino().child({ process: "removeExpired" });

let RETENTION_PERIOD = 365;

try {
  RETENTION_PERIOD = parseInt(config.retentionPeriod);
  logger.info(`config.retentionPeriod set to ${config.rentionPeriod}`);
} catch (e) {
  logger.error(R_ERRORS.CONFIG);
}

export async function redactSubmissions() {
  const today = new Date();
  const retentionLimit = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - RETENTION_PERIOD
  );

  try {
    logger.info(
      `Attempting to delete completed records updated < ${retentionLimit.toISOString()}. Retention period is set to ${RETENTION_PERIOD} days`
    );
    const del = await prisma.submission.deleteMany({
      where: {
        updated_at: {
          not: undefined,
          lt: retentionLimit,
        },
        complete: true,
      },
    });

    logger.info(`deleted ${del.count} records`);
  } catch (e) {
    logger.error(e, `${R_ERRORS.DELETION_FAILED} < ${retentionLimit}`);
  }
}
