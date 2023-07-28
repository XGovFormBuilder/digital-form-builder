import { createServer } from "./createServer";
import logger from "pino";
const initLogger = logger();

async function initApp() {
  const server = await createServer();
  await server.start();
  process.send && process.send("online");
}

initApp().catch((err) => {
  initLogger.error(["Server initialisation"], err.message);
});
