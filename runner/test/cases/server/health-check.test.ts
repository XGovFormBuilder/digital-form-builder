import Lab from "@hapi/lab";
import { execSync } from "child_process";
import { expect } from "@hapi/code";
import createServer from "src/server";

const LAST_COMMIT = execSync("git rev-parse HEAD").toString().trim();
const LAST_TAG = execSync("git describe --tags --abbrev=0").toString().trim();

const { before, test, suite, after } = (exports.lab = Lab.script());

suite(`/health-check Route`, () => {
  let server;

  before(async () => {
    server = await createServer({});
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("/health-check route response is correct", async () => {
    const options = {
      method: "GET",
      url: "/heath-check",
    };

    const { result } = await server.inject(options);

    expect(result.status).to.equal("OK");
    expect(result.lastCommit).to.equal(LAST_COMMIT);
    expect(result.lastTag).to.equal(LAST_TAG);
    expect(result.time).to.be.a.string();
  });
});
