import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { proceed, redirectTo, redirectUrl } from "../../src/helpers";
import sinon from "sinon";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { beforeEach, describe, suite, test } = lab;

suite("Helpers", () => {
  describe("proceed", () => {
    let h;
    const returnValue = "";
    beforeEach(() => {
      h = {
        redirect: sinon.stub(),
      };
      h.redirect.returns(returnValue);
    });

    test("Should redirect to the returnUrl if one is provided", () => {
      const returnUrl = "/my-return-url";
      const request = {
        query: {
          returnUrl: returnUrl,
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(returnUrl);
      expect(returned).to.equal(returnValue);
    });

    test("Should redirect to next url when no query params", () => {
      const request = {
        query: {},
      };
      const nextUrl = "badgers/monkeys";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(nextUrl);
      expect(returned).to.equal(returnValue);
    });

    test("Should redirect to next url ignoring most params from original request", () => {
      const request = {
        query: {
          myParam: "myValue",
          myParam2: "myValue2",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}`);
      expect(returned).to.equal(returnValue);
    });

    test("Should copy feedback param from the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}?f_t=myValue`);
      expect(returned).to.equal(returnValue);
    });

    test("Should copy visit param from the original request", () => {
      const request = {
        query: {
          visit: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}?visit=myValue`);
      expect(returned).to.equal(returnValue);
    });

    test("Should use params provided in nextUrl in preference to those in the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys?f_t=newValue";
      const returned = proceed(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}`);
      expect(returned).to.equal(returnValue);
    });
  });

  describe("redirectTo", () => {
    let h;
    const returnValue = "";
    beforeEach(() => {
      h = {
        redirect: sinon.stub(),
      };
      h.redirect.returns(returnValue);
    });

    test("Should redirect to next url when no query params in the request", () => {
      const request = {
        query: {},
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(nextUrl);
      expect(returned).to.equal(returnValue);
    });

    test("Should redirect to next url ignoring most params from original request", () => {
      const request = {
        query: {
          myParam: "myValue",
          myParam2: "myValue2",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}`);
      expect(returned).to.equal(returnValue);
    });

    test("Should copy feedback param from the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}?f_t=myValue`);
      expect(returned).to.equal(returnValue);
    });

    test("Should copy visit param from the original request", () => {
      const request = {
        query: {
          visit: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}?visit=myValue`);
      expect(returned).to.equal(returnValue);
    });

    test("Should use params provided in nextUrl in preference to those in the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys?f_t=newValue";
      const returned = redirectTo(request, h, nextUrl);

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}`);
      expect(returned).to.equal(returnValue);
    });

    test("Should set params from params object", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl, {
        returnUrl: "/myreturnurl",
        badger: "monkeys",
      });

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(
        `${nextUrl}?returnUrl=%2Fmyreturnurl&badger=monkeys&f_t=myValue`
      );
      expect(returned).to.equal(returnValue);
    });

    test("Should use params provided in params object in preference to those in the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectTo(request, h, nextUrl, { f_t: "newValue" });

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(`${nextUrl}?f_t=newValue`);
      expect(returned).to.equal(returnValue);
    });

    test("Should redirect to absolute url as provided without any adulteration", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "http://www.example.com/monkeys";
      const returned = redirectTo(request, h, nextUrl, { f_t: "newValue" });

      expect(h.redirect.callCount).to.equal(1);
      expect(h.redirect.firstCall.args[0]).to.equal(nextUrl);
      expect(returned).to.equal(returnValue);
    });
  });

  describe("redirectUrl", () => {
    test("Should return target url when no query params in the request", () => {
      const request = {
        query: {},
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl);

      expect(returned).to.equal(nextUrl);
    });

    test("Should return target url ignoring most params from original request", () => {
      const request = {
        query: {
          myParam: "myValue",
          myParam2: "myValue2",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl);

      expect(returned).to.equal(nextUrl);
    });

    test("Should copy feedback param from the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl);

      expect(returned).to.equal(`${nextUrl}?f_t=myValue`);
    });

    test("Should copy visit param from the original request", () => {
      const request = {
        query: {
          visit: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl);

      expect(returned).to.equal(`${nextUrl}?visit=myValue`);
    });

    test("Should use params provided in nextUrl in preference to those in the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys?f_t=newValue";
      const returned = redirectUrl(request, nextUrl);

      expect(returned).to.equal(nextUrl);
    });

    test("Should set params from params object", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl, {
        returnUrl: "/myreturnurl",
        badger: "monkeys",
      });

      expect(returned).to.equal(
        `${nextUrl}?returnUrl=%2Fmyreturnurl&badger=monkeys&f_t=myValue`
      );
    });

    test("Should use params provided in params object in preference to those in the original request", () => {
      const request = {
        query: {
          f_t: "myValue",
        },
      };
      const nextUrl = "badgers/monkeys";
      const returned = redirectUrl(request, nextUrl, { f_t: "newValue" });
      expect(returned).to.equal(`${nextUrl}?f_t=newValue`);
    });
  });
});
