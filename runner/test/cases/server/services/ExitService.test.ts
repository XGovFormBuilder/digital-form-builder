import * as sinon from "sinon";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FormModel } from "../../../../src/server/plugins/engine/models";
import form from "./../exit.test.json";
import { ExitService } from "server/services/ExitService";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, beforeEach, test } = lab;

const server = {
  logger: {
    info: sinon.spy(),
    debug: sinon.spy(),
    warn: sinon.spy(),
    error: sinon.spy(),
  },
};

let formModel;

suite("ExitService.exitForm", () => {
  let exitService;

  const state = {
    exitState: {
      exitEmailAddress: "j@cyb.dev",
      pageExitedOn: "/exit/first-page",
    },
    whichConsulate: "portimao",
    progress: ["/exit/first-page"],
  };
  beforeEach(() => {
    formModel = new FormModel(form, { basePath: "/exit" });
    exitService = new ExitService(server);
  });

  test("posts the correct data when format is WEBHOOK", async () => {
    const postRequest = sinon.stub(exitService, "postToExitUrl").returns({});
    await exitService.exitForm(formModel, state);

    const [_urlArg, payloadArg] = postRequest.getCall(0).args;

    expect(payloadArg).to.be.equal({
      exitState: {
        exitEmailAddress: "j@cyb.dev",
        pageExitedOn: "/exit/first-page",
      },
      formPath: "/exit",
      metadata: {
        caseType: "generic",
      },
      name: "exit test",
      questions: [
        {
          category: undefined,
          fields: [
            {
              answer: "portimao",
              key: "whichConsulate",
              title: "which consulate",
              type: "list",
            },
          ],
          index: 0,
          question: "First page",
        },
        {
          category: "yourDetails",
          fields: [
            {
              answer: undefined,
              key: "fullName",
              title: "Your full name",
              type: "text",
            },
          ],
          index: 0,
          question: "Second page",
        },
      ],
    });
  });

  test("posts the correct data when the format is STATE", async () => {
    const formWithStateOption = {
      ...form,
      exitOptions: { ...form.exitOptions, format: "STATE" },
    };
    formModel = new FormModel(formWithStateOption, { basePath: "/exit" });
    const postRequest = sinon.stub(exitService, "postToExitUrl").returns({});
    await exitService.exitForm(formModel, state);
    const [_urlArg, payloadArg] = postRequest.getCall(0).args;
    expect(payloadArg).to.be.equal({
      exitState: {
        exitEmailAddress: "j@cyb.dev",
        pageExitedOn: "/exit/first-page",
      },
      formPath: "/exit",
      progress: ["/exit/first-page"],
      whichConsulate: "portimao",
      metadata: {
        caseType: "generic",
      },
    });
  });

  test("throws Boom.forbidden if the form does not allow exit", () => {
    const formWithNoExitOptions = {
      ...form,
    };
    delete formWithNoExitOptions.exitOptions;

    formModel = new FormModel(formWithNoExitOptions, { basePath: "/exit" });

    expect(exitService.exitForm(formModel, state)).to.reject();
  });

  test("removes redirectUrl from the returned value if it is not on the safelist", async () => {
    sinon
      .stub(exitService, "postToExitUrl")
      .onFirstCall()
      .returns({ redirectUrl: "gov.uk" })
      .onSecondCall()
      .returns({ redirectUrl: "http://localhost:3005/test" });

    const resultWithInvalidRedirect = await exitService.exitForm(
      formModel,
      state
    );

    expect(resultWithInvalidRedirect).to.equal({});

    const resultWithValidRedirect = await exitService.exitForm(
      formModel,
      state
    );
    expect(resultWithValidRedirect).to.equal({
      redirectUrl: "http://localhost:3005/test",
    });
  });

  test("returns a parsed expiry date if it is in the response", async () => {
    sinon
      .stub(exitService, "postToExitUrl")
      .returns({ expiry: "2021-12-25T00:00:00.000Z" });
    expect(await exitService.exitForm(formModel, state)).to.equal({
      expiry: "25 December 2021",
    });
  });

  test("ignores the expiry date if it is not valid ISO string", async () => {
    sinon
      .stub(exitService, "postToExitUrl")
      .returns({ expiry: `${Date.now()}` });
    expect(await exitService.exitForm(formModel, state)).to.equal({});
  });
});
