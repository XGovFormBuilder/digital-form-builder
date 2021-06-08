import { createServer } from "./createServer";

createServer()
  .then((server) => server.start())
  .then(() => process.send && process.send("online"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
