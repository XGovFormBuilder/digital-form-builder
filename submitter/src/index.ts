import { createServer } from "./createServer";

async function initApp() {
  const server = await createServer();
  await server.start();
  process.send && process.send("online");
}

initApp().catch((err) => {
  console.error(err.message);
});
