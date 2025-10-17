import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

suite("Server Router", () => {
  let server;

  before(async () => {
    server = await createServer({});
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("cookies page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/cookies`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        `<h1 class="govuk-heading-l">Cookies on Digital Form Builder - Runner</h1>`
      ) > -1
    ).to.equal(true);
  });

  test("cookies preferences are set", async () => {
    const options = {
      method: "POST",
      payload: {
        cookies: "accept",
      },
      url: "/help/cookies",
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(302);
  });

  test("accessibility statement page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/accessibility-statement`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        '<h1 class="govuk-heading-l">Accessibility Statement</h1>'
      ) > -1
    ).to.equal(true);
  });

  test("terms and conditions page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/terms-and-conditions`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        '<h1 class="govuk-heading-l">Terms and conditions</h1>'
      ) > -1
    ).to.equal(true);
  });
});
