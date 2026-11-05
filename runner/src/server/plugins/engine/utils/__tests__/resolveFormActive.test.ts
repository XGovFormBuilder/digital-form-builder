import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, afterEach } = lab;

import { resolveFormActive } from "../resolveFormActive";

suite("resolveFormActive", () => {
  const baseDef = { pages: [] } as any;
  const originalEnv = process.env.TEST_FORM_ACTIVE_FLAG;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.TEST_FORM_ACTIVE_FLAG;
    } else {
      process.env.TEST_FORM_ACTIVE_FLAG = originalEnv;
    }
  });

  test("returns the definition unchanged when active is a boolean", () => {
    const def = { ...baseDef, active: false };
    expect(resolveFormActive(def)).to.equal(def);
  });

  test("returns the definition unchanged when active is undefined", () => {
    expect(resolveFormActive(baseDef)).to.equal(baseDef);
  });

  test("returns the definition unchanged when active is not a placeholder string", () => {
    const def = { ...baseDef, active: "not-a-placeholder" };
    expect(resolveFormActive(def)).to.equal(def);
  });

  test("resolves a placeholder to the environment variable's value", () => {
    process.env.TEST_FORM_ACTIVE_FLAG = "false";
    const def = { ...baseDef, active: "${TEST_FORM_ACTIVE_FLAG}" };

    expect(resolveFormActive(def).active).to.equal("false");
  });

  test("defaults to active when the environment variable is not set", () => {
    delete process.env.TEST_FORM_ACTIVE_FLAG;
    const def = { ...baseDef, active: "${TEST_FORM_ACTIVE_FLAG}" };

    expect(resolveFormActive(def).active).to.equal(true);
  });
});
