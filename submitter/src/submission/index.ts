import { createServer } from "./createServer";
import { setupDatabase } from "./setupDatabase";

async function initApp() {
  await setupDatabase();

  const server = await createServer();
  try {
    await server.start();
    process?.send?.("online");
  } catch (e) {
    throw e;
  }
}

initApp().catch((err) => {
  console.error(err.message);
});
