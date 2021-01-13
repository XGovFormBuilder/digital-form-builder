import Lab from "@hapi/lab";
import { expect } from "@hapi/code";

import createServer from "src/server/index";

const { suite, before, test, after } = (exports.lab = Lab.script());

suite("Rate limit", () => {
  let server;

  // Create server before each test
  before(async () => {
    server = await createServer({
      formFileName: "basic-v1.json",
      formFilePath: __dirname,
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
});
