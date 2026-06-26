import { isValidSecureFormSubmissionConfig } from "../isValidSecureFormSubmissionConfig";

const VALID_CONFIG = {
  tenantId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  clientId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  clientSecret: "super-secret-value-123",
  scopes: ["https://graph.microsoft.com/.default"],
};

describe("isValidSecureFormSubmissionConfig", () => {
  it("returns true for a valid config", () => {
    expect(isValidSecureFormSubmissionConfig(VALID_CONFIG)).toBe(true);
  });

  it("returns false when tenantId is empty", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, tenantId: "" })
    ).toBe(false);
  });

  it("returns false when tenantId is not a GUID", () => {
    expect(
      isValidSecureFormSubmissionConfig({
        ...VALID_CONFIG,
        tenantId: "not-a-guid",
      })
    ).toBe(false);
  });

  it("returns false when clientId is empty", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, clientId: "" })
    ).toBe(false);
  });

  it("returns false when clientId is not a GUID", () => {
    expect(
      isValidSecureFormSubmissionConfig({
        ...VALID_CONFIG,
        clientId: "not-a-guid",
      })
    ).toBe(false);
  });

  it("returns false when clientSecret is empty", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, clientSecret: "" })
    ).toBe(false);
  });

  it("returns false when scopes is empty", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, scopes: [] })
    ).toBe(false);
  });

  it("returns false when scopes contains an empty string", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, scopes: [""] })
    ).toBe(false);
  });

  it("returns false when scopes contains two empty string", () => {
    expect(
      isValidSecureFormSubmissionConfig({ ...VALID_CONFIG, scopes: ["", ""] })
    ).toBe(false);
  });
});
