import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import config from "src/server/config";

import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

const jwtAuthCookieName = "fsd_user_token";
const jwtAuthenticationUrl =
  "https://funding-service-design-authenticator-dev.london.cloudapps.digital/service/magic-links/invalid";
const rsa256PublicKeyBase64 =
  "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZU1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTUFEQ0JpQUtCZ0hHYnRGMXlWR1c" +
  "rckNBRk9JZGFrVVZ3Q2Z1dgp4SEUzOGxFL2kwS1dwTXdkU0haRkZMWW5IakJWT09oMTVFaWl6WXphNEZUSlRNdkwyRTRRckxwcV" +
  "lqNktFNnR2CkhyaHlQL041ZnlwU3p0OHZDajlzcFo4KzBrRnVjVzl6eU1rUHVEaXNZdG1rV0dkeEJta2QzZ3RZcDNtT0k1M1YKV" +
  "kRnS2J0b0lGVTNzSWs1TkFnTUJBQUU9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==";
const validTestJwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiJ1c2VyYSIsImlhdCI6MTY1OTUxOTQ2OCwiZXhwIjoxNj" +
  "U5NTIzMDY4fQ.SRBI_Y9WFfMydI9MbnemWdkI0CQ7jQ7dlHatasuzZbvMyoR9RTxJKI1WRRmef5bQ5TqJ_oo9itSWSwXGYPtPlz" +
  "fAECWMdA8krLz9iFdky33_If8LPCwYXgzgZXmblvnl5UuxBMPNnNW8BI6wTNY_9E_Axy7mdeeQGbQxgmxQxas";

suite("JWT Auth", () => {
  let server;

  suite("when enabled", () => {
    before(async () => {
      config.jwtAuthCookieName = jwtAuthCookieName;
      config.jwtAuthenticationUrl = jwtAuthenticationUrl;
      config.rsa256PublicKeyBase64 = rsa256PublicKeyBase64;
      server = await createServer({});
      await server.start();
    });

    after(async () => {
      await server.stop();
      config.jwtAuthCookieName = null;
      config.jwtAuthenticationUrl = null;
      config.rsa256PublicKeyBase64 = null;
    });

    test("forms page redirects to re-authenticate url if no valid jwt auth cookie found", async () => {
      const options = {
        method: "GET",
        url: "/about-your-org/about-your-organisation",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(401);
      expect(res.headers.location).to.startWith(config.jwtAuthenticationUrl);
    });

    test("returns requested form if a valid jwt auth cookie found", async () => {
      const options = {
        method: "GET",
        url: "/about-your-org/about-your-organisation",
        headers: {
          Cookie: jwtAuthCookieName + "=" + validTestJwt,
        },
      };

      const res = await server.inject(options);
      expect(res.statusCode).to.equal(200);
      expect(res.payload).to.contain("About your organisation");
    });
  });
});
