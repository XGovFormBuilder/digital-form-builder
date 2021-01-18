import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { createServer } from "../createServer";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, suite, test, after } = lab;

suite("Server tests", () => {
  let server;

  before(async () => {
    server = await createServer();
    await server.start();
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };
  });

  after(async () => {
    await server.stop();
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

  test("terms and conditions page is served", async () => {
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

  test("Phase banner is present", async (flags) => {
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };

    const options = {
      method: "get",
      url: "/new",
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        '<strong class="govuk-tag govuk-phase-banner__content__tag">'
      ) > -1
    ).to.equal(true);
  });

  test("Phase banner is present", async (flags) => {
    const options = {
      method: "get",
      url: "/new",
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(
      res.result.indexOf(
        '<strong class="govuk-tag govuk-phase-banner__content__tag">'
      ) > -1
    ).to.equal(true);
  });
});
