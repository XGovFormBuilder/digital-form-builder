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

  suite("when enabled", () => {
    before(async () => {
      config.authEnabled = true;
      config.authClientAuthUrl = "https://example.org/oauth/authorize";
      config.authClientTokenUrl = "https://example.org/oauth/token";
      config.authClientProfileUrl = "https://example.org/oauth/profile";
      config.authClientId = "oAuthClientID";
      config.authClientSecret = "oAuthClientSecret";
      server = await createServer({});
      await server.start();
    });

    after(async () => {
      await server.stop();
      config.authEnabled = false;
    });

    test("sign in page redirects to oAuth service", async () => {
      const options = {
        method: "GET",
        url: "/login",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.startWith(
        "https://example.org/oauth/authorize"
      );
    });

    test("sign in page returns to teh previous url", async () => {
      const options = {
        method: "POST",
        url: "/login?state=123456&code=123456",
        auth: {
          strategy: "oauth",
          credentials: {
            profile: {
              first_name: "Beep",
              last_name: "Boop",
              email: "b33pb00p@example.org",
            },
            // `query` here always contains the query for the original url accessed
            query: {
              returnUrl: "/foo-bar",
            },
          },
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal("/foo-bar");
    });

    test("sign out clears the auth cookie and session and redirects to start page", async () => {
      // Create an initial session
      const prepResponse = await server.inject({
        method: "GET",
        url: "/",
      });
      const initialSessionCookie = prepResponse.headers["set-cookie"]
        .find((cookie) => cookie.startsWith("session="))
        .replace("HttpOnly; ");

      // We can first check the created session works as expected:
      const checkPrepResponse = await server.inject({
        method: "GET",
        url: "/",
        headers: {
          Cookie: initialSessionCookie,
        },
      });
      expect(
        checkPrepResponse.headers["set-cookie"].find((cookie) =>
          cookie.startsWith("session=")
        )
      ).to.be.undefined();

      // Provide created session to prevent `inject` automatically creating a new one
      const res = await server.inject({
        method: "GET",
        url: "/logout",
        headers: {
          Cookie: initialSessionCookie,
        },
      });

      // Now we test that we _have_ created a new session
      const newSession = res.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("session=")
      );

      expect(newSession).to.not.be.undefined();
      expect(newSession).to.not.equal(initialSessionCookie);
      expect(
        res.headers["set-cookie"].filter((cookie) =>
          cookie.startsWith("auth=;")
        )[0]
      ).to.contain("Max-Age=0;");
      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal("/");
    });

    test("shows a 'sign out' link in the header if logged in", async () => {
      const options = {
        method: "GET",
        url: "/test/start",
        auth: {
          strategy: "session",
          credentials: {
            profile: {
              first_name: "Beep",
              last_name: "Boop",
              email: "b33pb00p@example.org",
            },
          },
        },
      };

      const res = await server.inject(options);

      expect(res.payload).to.contain('href="/logout"');
      expect(res.payload).to.contain("Sign out");
    });

    test("does not show a 'sign out' link in the header if logged out", async () => {
      const options = {
        method: "GET",
        url: "/test/start",
      };

      const res = await server.inject(options);

      expect(res.payload).not.to.contain('href="/logout"');
      expect(res.payload).not.to.contain("Sign out");
    });

    test("redirects to login page if accessing a question page", async () => {
      const options = {
        method: "GET",
        url: "/test/uk-passport",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal(
        "/login?returnUrl=/test/uk-passport"
      );
    });

    test("redirects to login page if accessing a summary page", async () => {
      const options = {
        method: "GET",
        url: "/test/summary",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(302);
      expect(res.headers.location).to.equal("/login?returnUrl=/test/summary");
    });

    test("does not redirect to login if accessing the start page", async () => {
      const options = {
        method: "GET",
        url: "/test/start",
      };

      const res = await server.inject(options);

      expect(res.statusCode).to.equal(200);
    });
  });
});
