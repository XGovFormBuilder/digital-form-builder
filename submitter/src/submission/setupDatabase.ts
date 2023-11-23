import { spawnSync } from "child_process";
import pino from "pino";
const logger = pino();

export function setupDatabase() {
  const schemaLocation = require.resolve(
    "@xgovformbuilder/queue-model/schema.prisma"
  );

  const child = spawnSync(
    "prisma",
    ["migrate", "deploy", "--schema", schemaLocation],
    {
      encoding: "utf-8",
      stdio: "inherit",
    }
  );

  if (child.status === 1) {
    logger.error("Could not connect to database, exiting");
    logger.error(child.error);
    process.exit(1);
  }

  if (child.stdout) {
    logger.info(child.stdout);
    logger.info("Database migration was successful, continuing");
  }
}
