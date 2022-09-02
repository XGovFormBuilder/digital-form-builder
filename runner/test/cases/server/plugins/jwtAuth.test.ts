import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import config from "src/server/config";

import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

const jwtAuthCookieName = "auth_token";
const jwtRedirectToAuthenticationUrl =
  "https://funding-service-design-authenticator-dev.london.cloudapps.digital/service/magic-links/invalid";
const rsa256PublicKeyBase64 =
  "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZU1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTUFEQ0JpQUtCZ0hHYnRGMXlWR1c" +
  "rckNBRk9JZGFrVVZ3Q2Z1dgp4SEUzOGxFL2kwS1dwTXdkU0haRkZMWW5IakJWT09oMTVFaWl6WXphNEZUSlRNdkwyRTRRckxwcV" +
  "lqNktFNnR2CkhyaHlQL041ZnlwU3p0OHZDajlzcFo4KzBrRnVjVzl6eU1rUHVEaXNZdG1rV0dkeEJta2QzZ3RZcDNtT0k1M1YKV" +
  "kRnS2J0b0lGVTNzSWs1TkFnTUJBQUU9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==";
const rsa256PrivateKeyBase64 =
  "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDV3dJQkFBS0JnSEdidEYxeVZHVytyQ0FGT0lkYWtVVndDZnV2eEhF" +
  "MzhsRS9pMEtXcE13ZFNIWkZGTFluCkhqQlZPT2gxNUVpaXpZemE0RlRKVE12TDJFNFFyTHBxWWo2S0U2dHZIcmh5UC9ONWZ5cFN6" +
  "dDh2Q2o5c3BaOCsKMGtGdWNXOXp5TWtQdURpc1l0bWtXR2R4Qm1rZDNndFlwM21PSTUzVlZEZ0tidG9JRlUzc0lrNU5BZ01CQUFF" +
  "QwpnWUJYSVhyZ1hHb2NLbk5xajNaK1lOaWZyOEVJVmhMTVhvTXJDeGdzTnNzbmZLSHhpeVBLWEJBTU02QlVzTzRuClF5MXdoUUdl" +
  "SlZFUDBFUVNBem5tTXVjcldBWW9sK3ZlOTVMZ1h0ckxFV1B0ZXRxL29VL2JvcWNTRklZMmp5NDUKUDBEcUo1NTZEMmtDTXZZT3pZ" +
  "L1NuTHFWVU9NOEtOT2w1L0kyODUxaTFqbUlJUUpCQUxFT2tLVm5Od0c0RkhQagpVVWJRLytNakI2clpCUzlqNXZ0cHN6WnZzdjlr" +
  "bWdMekkzVU5xdHY3QzBndENZNFBnMjArM1E5M2JUWUxFVXRKCnNJWGR4dGtDUVFDa1F3emFQend4ODRiUnJzT3dxUWU4MlZ0UlNG" +
  "dGNPbHo2UmhpYytWOVdYTStaakNUQ1JzcVoKVDZydGNCa21zQ0l5bUVJRFJiUWUvK1dKRFQ1ZlV1S1ZBa0EwWTlycEZtRndZTWVz" +
  "Z3RiSjNZM1o1OE9kQ2hvKwpxNUR0VTVsendobDArSStaejlmdUN0MUR1a1RjVm5jOVVkblJ1WWd2eTJiRlZ3RUhCZ2IxbFdvQkFr" +
  "QWRkblZZCnRCenM3THhTNGVEeHorKzJYTm8zUXg0MzliUDFwQnNJRk9hWHkvL2tqN0dNTXp4bHNWZDhUUzRGdFhQODFUaUoKODdl" +
  "eUU3NHREZllSRFFIZEFrRUFoU2JQbFJjUVN3RW9tNTdjRlkzdFd6blJVTTNveCtCNTZ0eGxDalgxSnBpWApYUDltNzE4RnBCdFNX" +
  "cSs0Z3MweUFvTHVqWnlLOUJvV3ZFbXFybTZPOFE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQ==";
const JWT = require("jsonwebtoken");
const secret = Buffer.from(rsa256PrivateKeyBase64 ?? "", "base64");

const timeUnixNow = Math.floor(new Date().getTime() / 1000);
const valid_jwt_payload = {
  accountId: "6b230fc7-b8f2-4393-8eed-1b03896de77f",
  iat: timeUnixNow,
  exp: timeUnixNow + 300,
};
const expired_jwt_payload = {
  accountId: "6b230fc7-b8f2-4393-8eed-1b03896de77f",
  iat: timeUnixNow - 2,
  exp: timeUnixNow - 1,
};

const validTestJwt = JWT.sign(valid_jwt_payload, secret, {
  algorithm: "RS256",
});
const expiredTestJwt = JWT.sign(expired_jwt_payload, secret, {
  algorithm: "RS256",
});

suite("JWT Auth", () => {
  let server;

  suite("when enabled", () => {
    before(async () => {
      config.jwtAuthCookieName = jwtAuthCookieName;
      config.jwtRedirectToAuthenticationUrl = jwtRedirectToAuthenticationUrl;
      config.rsa256PublicKeyBase64 = rsa256PublicKeyBase64;
      server = await createServer({});
      await server.start();
    });

    after(async () => {
      await server.stop();
      config.jwtAuthCookieName = null;
      config.jwtRedirectToAuthenticationUrl = null;
      config.rsa256PublicKeyBase64 = null;
    });

    test("forms page redirects to re-authenticate url if no valid jwt auth cookie found", async () => {
      const options = {
        method: "GET",
        url: "/about-your-org/about-your-organisation",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.startWith(
        config.jwtRedirectToAuthenticationUrl
      );
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

    test("forms page redirects to re-authenticate url if expired jwt auth cookie found", async () => {
      const options = {
        method: "GET",
        url: "/about-your-org/about-your-organisation",
        headers: {
          Cookie: jwtAuthCookieName + "=" + expiredTestJwt,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.startWith(
        config.jwtRedirectToAuthenticationUrl
      );
    });
  });
});
