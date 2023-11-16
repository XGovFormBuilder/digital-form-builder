import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import { StatusService } from "server/services";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

const cacheService = { getState: () => ({}), mergeState: () => {} },
  webhookService = { postRequest: () => ({}) },
  notifyService = { sendNotification: () => ({}) },
  payService = {
    payStatus: () => {},
  };

const yar = {
  id: "session_id",
};

const app = {
  forms: {
    test: {
      feeOptions: {
        allowSubmissionWithoutPayment: true,
        maxAttempts: 3,
      },
    },
  },
};

const server = {
  services: () => ({
    cacheService,
    webhookService,
    payService,
    notifyService,
  }),
  logger: {
    info: () => {},
    trace: () => {},
  },
  app,
};

suite("StatusService shouldShowPayErrorPage", () => {
  afterEach(() => {
    sinon.restore();
  });
  test("returns false when no pay information is saved in the session", async () => {
    const statusService = new StatusService(server);
    expect(await statusService.shouldShowPayErrorPage({ yar })).to.equal(false);
  });

  test("returns false when the continue query parameter is true", async () => {
    sinon.stub(cacheService, "getState").returns({ state: { pay: {} } });
    const statusService = new StatusService(server);
    expect(
      await statusService.shouldShowPayErrorPage({
        yar,
        query: { continue: "true" },
        params: {
          id: "test",
        },
      })
    ).to.equal(false);
  });

  test("returns false when 3 pay attempts have been made", async () => {
    sinon
      .stub(cacheService, "getState")
      .returns({ state: { pay: { meta: 3 } } });
    const statusService = new StatusService(server);

    expect(
      await statusService.shouldShowPayErrorPage({
        yar,
        app,
        params: { id: "test" },
      })
    ).to.equal(false);
  });

  test("returns true when <3 pay attempts have been made", async () => {
    sinon
      .stub(cacheService, "getState")
      .returns({ pay: { meta: { attempts: 1 } } });

    sinon.stub(payService, "payStatus").returns({
      state: {
        status: "failed",
      },
    });

    const statusService = new StatusService(server);
    expect(
      await statusService.shouldShowPayErrorPage({
        yar,
        app,
        params: { id: "test" },
        server,
      })
    ).to.equal(true);
  });

  test("returns true when >3 pay attempts have been made and form does not allow submissions without payment", async () => {
    sinon
      .stub(cacheService, "getState")
      .returns({ pay: { meta: { attempts: 5 } } });

    sinon.stub(payService, "payStatus").returns({
      state: {
        status: "failed",
      },
    });

    sinon.stub(app, "forms").value({
      test: {
        feeOptions: {
          allowSubmissionWithoutPayment: false,
          maxAttempts: 3,
        },
      },
    });

    const statusService = new StatusService(server);
    expect(
      await statusService.shouldShowPayErrorPage({
        yar,
        app,
        params: { id: "test" },
        server,
      })
    ).to.equal(true);
  });

  test("returns true when <3 and the continue query is true", async () => {
    sinon
      .stub(cacheService, "getState")
      .returns({ pay: { meta: { attempts: 1 } } });

    sinon.stub(payService, "payStatus").returns({
      state: {
        status: "failed",
      },
    });

    const statusService = new StatusService(server);
    expect(
      await statusService.shouldShowPayErrorPage({
        yar,
        app,
        params: {
          id: "test",
        },
        query: { continue: "true" },
        server,
      })
    ).to.equal(false);
  });
});
suite("StatusService outputRequests", () => {
  afterEach(() => {
    sinon.restore();
  });
  const notifyOutput = {
    outputData: {
      type: "notify",

      apiKey: "a",
      templateId: "b",
      emailAddress: "c",
      personalisation: {},
      addReferencesToPersonalisation: false,
    },
  };
  const firstWebhook = {
    type: "webhook",
    outputData: { url: "abc" },
  };
  const webhookOutput = {
    type: "webhook",
    outputData: { url: "" },
  };
  const outputs = [firstWebhook, webhookOutput, webhookOutput, notifyOutput];
  const state = {
    webhookData: { metadata: {} },
    outputs,
    pay: { meta: { attempts: 1 } },
  };

  test("makes and returns correct output requests", async () => {
    sinon.stub(cacheService, "getState").returns(state);
    const stub = sinon.stub(webhookService, "postRequest");
    stub
      .onCall(0)
      .resolves("abcd-ef-g")
      .onCall(1)
      .rejects()
      .onCall(2)
      .resolves("3");

    const statusService = new StatusService(server);
    const res = await statusService.outputRequests({ yar });

    const results = await res.results;
    expect(res.reference).to.equal("abcd-ef-g");
    expect(results.length).to.equal(outputs.length - 1);
    expect(results.map((result) => result.status)).to.equal([
      "fulfilled",
      "rejected",
      "fulfilled",
    ]);
    expect(results[2].value).to.equal("3");
  });
});
