import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { RiskReportApiService } from "../../../../src/server/services/riskReportApiService";
import { JsonApiIntegrationWithMsal } from "../../../../src/server/services/jsonApiIntegrationWithMsal";
import { ControllerError } from "../../../../src/server/plugins/engine/errors";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, afterEach } = lab;

describe("RiskReportApiService", () => {
  afterEach(() => {
    sinon.restore();
  });

  const buildService = () =>
    new RiskReportApiService("riskReportApiService", {
      apimBaseUrl: "https://example.test",
      callingApplication: "RPS",
      tenantId: "tenant",
      clientId: "client",
      clientSecret: "secret",
      scopes: ["scope"],
    });

  describe("lookupAddress", () => {
    it("rejects invalid data without calling the backend", async () => {
      const requestStub = sinon.stub(
        JsonApiIntegrationWithMsal.prototype,
        "request"
      );
      const service = buildService();

      await expect(service.lookupAddress({} as any)).to.reject(ControllerError);

      expect(requestStub.called).to.be.false();
    });

    it("returns the typed response on success", async () => {
      sinon.stub(JsonApiIntegrationWithMsal.prototype, "request").resolves({
        status: 200,
        json: sinon.stub().resolves({
          requestId: "uuid-1",
          success: true,
          UDPRN: "12345678",
          found: true,
        }),
      } as any);

      const service = buildService();

      const result = await service.lookupAddress({
        uuid: "3f2c1a9e-8b7d-4c6e-9f1a-2b3c4d5e6f70",
        udprn: "12345678",
        countryCode: "E",
        fullAddress: "10 Downing Street",
      });

      expect(result.found).to.equal(true);
    });

    it("throws when the backend responds with an error", async () => {
      sinon.stub(JsonApiIntegrationWithMsal.prototype, "request").resolves({
        status: 500,
        json: sinon.stub().resolves({}),
      } as any);

      const service = buildService();

      await expect(
        service.lookupAddress({
          uuid: "3f2c1a9e-8b7d-4c6e-9f1a-2b3c4d5e6f70",
          udprn: "12345678",
          countryCode: "E",
          fullAddress: "10 Downing Street",
        })
      ).to.reject(ControllerError);
    });
  });

  describe("storeReport", () => {
    it("returns the typed response on success", async () => {
      sinon.stub(JsonApiIntegrationWithMsal.prototype, "request").resolves({
        status: 200,
        json: sinon.stub().resolves({
          message: "",
          uuid: "00000000-0000-0000-0000-000000000002",
        }),
      } as any);

      const service = buildService();

      const result = await service.storeReport({
        uuid: "00000000-0000-0000-0000-000000000002",
        firstName: "Jane",
        lastName: "Doe",
        deliveryMethod: "email",
        email: "jane.doe@example.com",
        amount: 390,
      });

      expect(result.uuid).to.equal("00000000-0000-0000-0000-000000000002");
    });

    it("rejects invalid data without calling the backend", async () => {
      const requestStub = sinon.stub(
        JsonApiIntegrationWithMsal.prototype,
        "request"
      );
      const service = buildService();

      await expect(
        service.storeReport({
          uuid: "00000000-0000-0000-0000-000000000002",
          firstName: "Jane",
          lastName: "Doe",
          deliveryMethod: "email",
        } as any)
      ).to.reject(ControllerError);

      expect(requestStub.called).to.be.false();
    });
  });
});
