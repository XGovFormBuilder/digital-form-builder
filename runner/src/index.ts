import createServer from "./server";
import logger from "./server/plugins/logger";

createServer({})
  .then((server) => server.start())
  .then(() => process.send && process.send("online"))
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
