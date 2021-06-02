import createServer from "./server";
const pino = require("pino")();

createServer({})
  .then((server) => server.start())
  .then(() => process.send && process.send("online"))
  .catch((err) => {
    pino.error(err);
    process.exit(1);
  });
