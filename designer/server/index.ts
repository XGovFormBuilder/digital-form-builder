import { createServer } from "./createServer";
const pino = require("pino")();

createServer()
  .then((server) => server.start())
  .then(() => process.send && process.send("online"))
  .catch((err) => {
    pino.log(err);
    process.exit(1);
  });
