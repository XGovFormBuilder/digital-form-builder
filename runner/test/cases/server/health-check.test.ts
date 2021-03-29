import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import createServer from "src/server";
import config from "src/server/config";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite(`/health-check Route`, () => {
  let server;

  before(async () => {
    config.lastCommit = "Last Commit";
    config.lastTag = "Last Tag";
    server = await createServer({});
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("/health-check route response is correct", async () => {
    const options = {
      method: "GET",
      url: "/health-check",
    };

    const { result } = await server.inject(options);

    expect(result.status).to.equal("OK");
    expect(result.lastCommit).to.equal("Last Commit");
    expect(result.lastTag).to.equal("Last Tag");
    expect(result.time).to.be.a.string();
  });
});
