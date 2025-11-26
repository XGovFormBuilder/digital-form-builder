import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { isAllowedDomain } from "server/utils/domain";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Empty whitelist: should return all emails as valid", () => {
  test("Empty email with empty domain whitelist", () => {
    const email: string = "";
    const domainList: string[] = [];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Invalid email with no '@' and empty domain whitelist", () => {
    const email: string = "test";
    const domainList: string[] = [];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid email with empty domain whitelist", () => {
    const email: string = "example@example.com";
    const domainList: string[] = [];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });
});

suite("Whitelist with a single domain", () => {
  test("Valid email with leading/trailing whitespace", () => {
    const email = "  test@example.com  ";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid email in domain whitelist", () => {
    const email: string = "test@example.com";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid email with uppercase domain in address", () => {
    const email: string = "test@ExAmPlE.com";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid email with uppercase domain in whitelist", () => {
    const email: string = "test@example.com";
    const domainList: string[] = ["Example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid subdomain should match base domain", () => {
    const email = "user@mail.example.com";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Invalid email: no '@'", () => {
    const email: string = "test";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: only '@'", () => {
    const email: string = "@";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: missing local-part", () => {
    const email: string = "@example.com";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: domain not in whitelist", () => {
    const email: string = "test@gmail.com";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: domain does not exactly match whitelist", () => {
    const email: string = "test@example.test.com";
    const domainList: string[] = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: domain ends with similar string", () => {
    const email = "user@notexample.com";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: multiple '@' symbols", () => {
    const email = "test@me@example.com";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: missing TLD", () => {
    const email = "user@example";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: domain is substring of whitelisted domain", () => {
    const email = "user@ple.com";
    const domainList = ["example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });
});

suite("Whitelist with multiple domains", () => {
  test("Valid email in one of the whitelisted domains", () => {
    const email: string = "test@gmail.com";
    const domainList: string[] = ["example.com", "gmail.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Valid email with uppercase domain, mixed whitelist order", () => {
    const email: string = "test@ExAmPlE.com";
    const domainList: string[] = ["gmail.com", "example.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(true);
  });

  test("Invalid email: no '@'", () => {
    const email: string = "test";
    const domainList: string[] = ["example.com", "gmail.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: only '@'", () => {
    const email: string = "@";
    const domainList: string[] = ["example.com", "gmail.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });

  test("Invalid email: missing local part", () => {
    const email: string = "@example.com";
    const domainList: string[] = ["example.com", "gmail.com"];
    expect(isAllowedDomain(email, domainList)).to.equal(false);
  });
});
