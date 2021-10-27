import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import Wreck from "@hapi/wreck";
import config from "../server/config";

import { PreviewPersistenceService } from "../server/lib/persistence/previewPersistenceService";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, afterEach, suite, test } = lab;
const sandbox = sinon.createSandbox();

suite("PreviewPersistenceService", () => {
  const UPLOAD_RESPONSE = { result: "UPLOAD RESPONSE" };
  const GET_RESPONSE = {
    payload: Buffer.from(JSON.stringify({ values: "OK" })),
  };

  beforeEach(async () => {
    sandbox.stub(Wreck, "get").callsFake(() => {
      return Promise.resolve(GET_RESPONSE);
    });
    sandbox.stub(Wreck, "post").callsFake((url) => {
      return Promise.resolve(UPLOAD_RESPONSE);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  test("it uploads configuration", async () => {
    const previewService = new PreviewPersistenceService();
    const id = "123ABC";
    const configuration = "test";
    const result = await previewService.uploadConfiguration(id, configuration);

    // @ts-ignore
    expect(Wreck.post.getCall(0).args).to.equal([
      `${config.publishUrl}/publish`,
      {
        payload: JSON.stringify({ id, configuration }),
      },
    ]);

    expect(result).to.equal(UPLOAD_RESPONSE as any);
  });

  test("it copies configuration", async () => {
    const previewService = new PreviewPersistenceService();
    const configId = "123ABC";
    const newName = "test";
    const result = await previewService.copyConfiguration(configId, newName);

    // @ts-ignore
    expect(Wreck.get.getCall(0).args).to.equal([
      `${config.publishUrl}/published/${configId}`,
    ]);

    // @ts-ignore
    expect(Wreck.post.getCall(0).args).to.equal([
      `${config.publishUrl}/publish`,
      {
        payload: JSON.stringify({ id: newName, configuration: "OK" }),
      },
    ]);

    expect(result).to.equal(UPLOAD_RESPONSE as any);
  });

  test("it lists all configurations", async () => {
    const previewService = new PreviewPersistenceService();
    const result = await previewService.listAllConfigurations();
    expect(result).to.equal(JSON.parse(GET_RESPONSE.payload.toString()));
  });

  test("it gets a configuration", async () => {
    const id = "123ABC";
    const previewService = new PreviewPersistenceService();
    const result = await previewService.getConfiguration(id);

    // @ts-ignore
    expect(Wreck.get.getCall(0).args).to.equal([
      `${config.publishUrl}/published/${id}`,
    ]);

    expect(result).to.equal(GET_RESPONSE.payload.toString());
  });
});
