import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import config from "src/server/config";

import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

suite("Server Auth", () => {
  let server;

  before(async () => {
    config.ssoEnabled = true;
    config.ssoClientAuthUrl = "https://example.org/oauth/authorize";
    config.ssoClientTokenUrl = "https://example.org/oauth/token";
    config.ssoClientProfileUrl = "https://example.org/oauth/profile";
    config.ssoClientId = "oAuthClientID";
    config.ssoClientSecret = "oAuthClientSecret";
    server = await createServer({});
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("sign in page redirects to oAuth service", async () => {
    const options = {
      method: "GET",
      url: `/login`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(302);
    expect(res.headers.location).to.startWith(
      "https://example.org/oauth/authorize"
    );
  });

  test("sign out clears the auth cookie and redirects", async () => {
    const options = {
      method: "GET",
      url: `/logout`,
    };

    const res = await server.inject(options);

    expect(
      res.headers["set-cookie"].filter((cookie) =>
        cookie.startsWith("auth=;")
      )[0]
    ).to.contain("Max-Age=0;");
    expect(res.statusCode).to.equal(302);
    expect(res.headers.location).to.startWith("/account");
  });
});
