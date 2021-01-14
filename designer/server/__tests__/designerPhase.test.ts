import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { createServer } from "../createServer";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, suite, test, after } = lab;

suite("Designer phase banner", () => {
  let server;

  before(async () => {
    server = await createServer();
    await server.start();

    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };
  });

  after((done) => {
    server.stop();
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
