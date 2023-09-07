import { redactSubmissions } from "./src/redactSubmissions";
import logger from "pino";

const initLogger = logger();

async function main() {
  await redactSubmissions();
}

main()
  .then(() => {
    initLogger.info("All jobs completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    initLogger.error(["retention"], err);
    process.exit(1);
  });
