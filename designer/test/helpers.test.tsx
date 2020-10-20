import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { camelCase } from "../client/helpers";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, describe, test } = lab;

suite("helpers", () => {
  describe("camelCase", () => {
    test("should camel case string", () => {
      expect(camelCase("My page")).to.equal("myPage");
    });

    test("should camel case string with leading space", () => {
      expect(camelCase(" My page")).to.equal("myPage");
    });

    test("should camel case hyphenated string", () => {
      expect(camelCase("My-page")).to.equal("myPage");
    });

    test("should camel case underscored string", () => {
      expect(camelCase("My_page")).to.equal("myPage");
    });

    test("should camel case string with special chars", () => {
      expect(camelCase("My page!$£")).to.equal("myPage");
    });

    test("should camel case string with apostrophes chars", () => {
      expect(camelCase("Bob's your uncle")).to.equal("bobsYourUncle");
    });
  });
});
