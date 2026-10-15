import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { GasTestKitApiService } from "../../../../src/server/services/gasTestKitApiService";
import { JsonApiIntegrationWithMsal } from "../../../../src/server/services/jsonApiIntegrationWithMsal";
import { ControllerError } from "../../../../src/server/plugins/engine/errors";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, afterEach } = lab;

describe("GasTestKitApiService", () => {
  afterEach(() => {
    sinon.restore();
  });

  const buildService = () =>
    new GasTestKitApiService("gasTestKitApiService", {
      apimBaseUrl: "https://example.test",
      callingApplication: "RPS",
      tenantId: "tenant",
      clientId: "client",
      clientSecret: "secret",
      scopes: ["scope"],
    });

  const validData = {
    uuid: "00000000-0000-0000-0000-000000000003",
    customer: {
      title: "Mr",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
    },
    measurementAddress: { fullAddress: "10 Downing Street" },
    kitRecipient: { title: "Mr", firstName: "John", lastName: "Smith" },
    kitRecipientAddress: { fullAddress: "10 Downing Street" },
    resultsRecipient: { title: "Mr", firstName: "John", lastName: "Smith" },
    resultsRecipientAddress: { fullAddress: "10 Downing Street" },
    prevTestedAddress: false,
    prevAboveActionLevel: false,
    remediationComplete: false,
    amount: 5280,
  };

  it("rejects invalid data without calling the backend", async () => {
    const requestStub = sinon.stub(
      JsonApiIntegrationWithMsal.prototype,
      "request"
    );
    const service = buildService();

    await expect(service.storeGtk({} as any)).to.reject(ControllerError);

    expect(requestStub.called).to.be.false();
  });

  it("returns the typed response on success", async () => {
    sinon.stub(JsonApiIntegrationWithMsal.prototype, "request").resolves({
      status: 200,
      json: sinon.stub().resolves({ message: "", uuid: validData.uuid }),
    } as any);

    const service = buildService();

    const result = await service.storeGtk(validData);

    expect(result.uuid).to.equal(validData.uuid);
  });

  it("throws when the backend responds with an error", async () => {
    sinon.stub(JsonApiIntegrationWithMsal.prototype, "request").resolves({
      status: 500,
      json: sinon.stub().resolves({
        success: false,
        error: "backend rejected it",
      }),
    } as any);

    const service = buildService();

    await expect(service.storeGtk(validData)).to.reject(ControllerError);
  });
});
