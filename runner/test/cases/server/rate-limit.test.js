import Lab from "@hapi/lab";
import { expect } from "@hapi/code";

import createServer from "../../../src/server/index";

const { suite, before, test, after } = (exports.lab = Lab.script());

suite("Rate limit", () => {
  let server;

  // Create server before each test
  before(async () => {
    server = await createServer({
      data: "basic-v1.json",
      customPath: __dirname,
      rateOptions: { userLimit: 1, userCache: { expiresIn: 5000 } },
    });
    server.route({
      method: "GET",
      path: "/start",
      handler: () => {
        return {};
      },
      options: {
        plugins: {
          "hapi-rate-limit": true,
        },
      },
    });
    await server.start();
  });
  after(async () => {
    await server.stop();
  });

  test("throws 429 error when rate limit is exceeded", async () => {
    await server.inject("/start");
    const response = await server.inject("/start");
    expect(response.statusCode).to.equal(429);
  });

  test(
    "after expiry period, requests return OK response",
    { timeout: 30000 },
    async () => {
      await server.inject("/start");
      const response = await server.inject("/start");
      expect(response.statusCode).to.equal(429);
      await new Promise((resolve) => setTimeout(resolve, 7500));
      const afterWaitingResponse = await server.inject("/start");
      expect(afterWaitingResponse.statusCode).to.equal(200);
    }
  );
});
