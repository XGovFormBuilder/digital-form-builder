import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import * as path from "path";
import cheerio from "cheerio";
import { restore, stub } from "sinon";
import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, afterEach, before, beforeEach, suite, test } = lab;

const formId = "status.test";

suite("GET /{id}/status", () => {
  let server;
  let form;

  before(async () => {
    server = await createServer({
      formFileName: `${formId}.json`,
      formFilePath: path.join(__dirname, ".."),
      enforceCsrf: false,
    });
    await server.initialize();
    form = server.app.forms[formId];
  });

  after(async () => {
    await server.stop();
  });

  beforeEach(() => {
    const { cacheService, statusService } = server.services();
    stub(statusService, "shouldShowPayErrorPage").resolves(false);
    stub(statusService, "outputRequests").resolves({ reference: "ABC123" });
    stub(cacheService, "getConfirmationState").resolves(undefined);
    stub(cacheService, "getState").resolves({ userCompletedSummary: true });
    stub(cacheService, "setConfirmationState").resolves();
    stub(cacheService, "clearState").resolves();
  });

  afterEach(() => {
    restore();
    delete form.def.feedback;
  });

  test("renders the confirmation page for a form without a feedback block", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/${formId}/status`,
    });

    const $ = cheerio.load(res.payload);
    expect(res.statusCode).to.equal(200);
    expect($("title").text()).to.contain("Confirmation");
    expect($(".govuk-phase-banner").length).to.equal(1);
    expect($(".govuk-phase-banner a").length).to.equal(0);
  });

  test("links to the form's feedback url", async () => {
    form.def.feedback = { url: "https://example.com/feedback" };

    const res = await server.inject({
      method: "GET",
      url: `/${formId}/status`,
    });

    expect(res.statusCode).to.equal(200);
    expect(
      cheerio.load(res.payload)(".govuk-phase-banner a").attr("href")
    ).to.equal("https://example.com/feedback");
  });
});
