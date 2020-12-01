import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { createServer } from "../../server/createServer";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, suite, test } = lab;

suite("Server Help Pages", () => {
  let server;

  before(async () => {
    server = await createServer();
    await server.start();
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
        '<h1 class="govuk-heading-xl">Accessibility Statement</h1>'
      ) > -1
    ).to.equal(true);
  });

  test("cookies page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/cookies`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf('<h1 class="govuk-heading-xl">Cookies</h1>') > -1
    ).to.equal(true);
  });

  test.only("terms and conditions page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/terms-and-conditions`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        '<h1 class="govuk-heading-xl">Terms and conditions</h1>'
      ) > -1
    ).to.equal(true);
  });
});
