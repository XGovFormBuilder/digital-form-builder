import { createHash } from "crypto";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { HapiRequest } from "../../../../src/server/types";
import { TrustPaymentsService } from "../../../../src/server/services/trustPaymentsService";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

const hashPassword = "s3cr3t-password";

function buildRequest(query: Record<string, string>): HapiRequest {
  return { query } as unknown as HapiRequest;
}

function validHashFor(query: Record<string, string>): string {
  const paramString =
    Object.entries(query)
      .filter(([paramKey]) => paramKey !== "responsesitesecurity")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, paramValue]) => paramValue)
      .join("") + hashPassword;

  return createHash("sha256").update(paramString, "utf8").digest("hex");
}

suite("Server TrustPaymentsService Service", () => {
  test("returns true when responsesitesecurity matches the computed hash", () => {
    const service = new TrustPaymentsService("trustPaymentsService", {
      siteReference: "site1234",
      hashPassword,
    });

    const query = {
      status: "0",
      transactionreference: "txn-789",
    };
    const responsesitesecurity = validHashFor(query);

    const request = buildRequest({ ...query, responsesitesecurity });

    expect(service.verifyRedirect(request)).to.equal(true);
  });

  test("returns false when responsesitesecurity does not match the computed hash", () => {
    const service = new TrustPaymentsService("trustPaymentsService", {
      siteReference: "site1234",
      hashPassword,
    });

    const query = {
      status: "0",
      transactionreference: "txn-789",
    };

    const request = buildRequest({
      ...query,
      responsesitesecurity: "not-the-right-hash",
    });

    expect(service.verifyRedirect(request)).to.equal(false);
  });

  test("returns false when query params have been tampered with", () => {
    const service = new TrustPaymentsService("trustPaymentsService", {
      siteReference: "site1234",
      hashPassword,
    });

    const query = {
      status: "0",
      transactionreference: "txn-789",
    };
    const responsesitesecurity = validHashFor(query);

    const request = buildRequest({
      status: "3", // tampered value, hash no longer matches
      transactionreference: "txn-789",
      responsesitesecurity,
    });

    expect(service.verifyRedirect(request)).to.equal(false);
  });

  test("throws a ControllerError when responsesitesecurity is missing", () => {
    const service = new TrustPaymentsService("trustPaymentsService", {
      siteReference: "site1234",
      hashPassword,
    });

    const request = buildRequest({
      status: "0",
      transactionreference: "txn-789",
    });

    expect(() => service.verifyRedirect(request)).to.throw(
      Error,
      "ControllerError: invalid redirect structure from trust payments"
    );
  });
});
