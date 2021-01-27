import { execSync } from "child_process";
import { createServer } from "../createServer";

const LAST_COMMIT = execSync("git rev-parse HEAD").toString().trim();
const LAST_TAG = execSync("git describe --tags --abbrev=0").toString().trim();

describe(`/health-check Route`, () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("/health-check route response is correct", async () => {
    const options = {
      method: "GET",
      url: "/health-check",
    };

    const { result } = await server.inject(options);

    expect(result.status).toEqual("OK");
    expect(result.lastCommit).toEqual(LAST_COMMIT);
    expect(result.lastTag).toEqual(LAST_TAG);
    expect(typeof result.time).toBe("string");
  });
});
