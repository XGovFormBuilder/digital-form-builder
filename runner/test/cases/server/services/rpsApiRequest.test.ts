import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import joi from "joi";
import { postValidated } from "../../../../src/server/services/rpsApiRequest";
import { JsonApiIntegrationWithMsal } from "../../../../src/server/services/jsonApiIntegrationWithMsal";
import { ControllerError } from "../../../../src/server/plugins/engine/errors";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, afterEach } = lab;

describe("postValidated", () => {
  afterEach(() => {
    sinon.restore();
  });

  const schema = joi.object({ name: joi.string().required() });

  const buildClient = () =>
    ({ request: sinon.stub() } as unknown as JsonApiIntegrationWithMsal);

  it("throws a ControllerError without calling request when validation fails", async () => {
    const client = buildClient();

    await expect(
      postValidated(client, "/some-path", schema, {}, "failed")
    ).to.reject(ControllerError);

    expect((client.request as sinon.SinonStub).called).to.be.false();
  });

  it("throws the failure message when the response status is not 200", async () => {
    const client = buildClient();
    (client.request as sinon.SinonStub).resolves({
      status: 500,
      json: sinon.stub().resolves({}),
    });

    await expect(
      postValidated(client, "/some-path", schema, { name: "a" }, "failed")
    ).to.reject(ControllerError, "ControllerError: failed");
  });

  // Callers check `success` on the returned body; only non-200 statuses throw here.
  it("returns the body when a 200 response has an error, for the caller to check", async () => {
    const client = buildClient();
    (client.request as sinon.SinonStub).resolves({
      status: 200,
      json: sinon.stub().resolves({ error: "backend rejected it" }),
    });

    const result = await postValidated(
      client,
      "/some-path",
      schema,
      { name: "a" },
      "failed"
    );

    expect(result).to.equal({ error: "backend rejected it" });
  });

  it("returns the parsed body on success", async () => {
    const client = buildClient();
    (client.request as sinon.SinonStub).resolves({
      status: 200,
      json: sinon.stub().resolves({ message: "ok" }),
    });

    const result = await postValidated(
      client,
      "/some-path",
      schema,
      { name: "a" },
      "failed"
    );

    expect(result).to.equal({ message: "ok" });
  });
});
