import * as sinon from "sinon";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const nanoid = require("server/services/payService.nanoid");
import { PayService } from "server/services/payService";
import { format } from "date-fns";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, describe, before, test, after } = lab;

const server = {
  logger: {
    info: sinon.spy(),
    debug: sinon.spy(),
    warn: sinon.spy(),
    error: sinon.spy(),
  },
};

suite("Server PayService Service", () => {
  test("Currency formatted correctly in description", async () => {
    const service = new PayService(server);
    const result = service.descriptionFromFees({
      total: 3.5,
      details: [
        {
          description: "A",
          amount: 350,
        },
      ],
    });
    expect(result).to.equal("A: £3.50");
  });

  test("Currency formatted correctly in description with multipliers", async () => {
    const service = new PayService(server);
    const result = service.descriptionFromFees({
      paymentReference: "",
      total: 3.5,
      details: [
        {
          description: "A",
          amount: 350,
          multiplier: "numberOf",
          multiplyBy: 3,
        },
      ],
    });
    expect(result).to.equal("3 x A: £10.50");
  });

  test("Currency formatted correctly in description with multiple fees", async () => {
    const service = new PayService(server);

    const result = service.descriptionFromFees({
      total: 3.5,
      details: [
        {
          description: "A",
          amount: 350,
          multiplier: "numberOf",
          multiplyBy: 3,
        },
        {
          description: "B",
          amount: 15000,
        },
      ],
    });
    expect(result).to.equal("3 x A: £10.50, B: £150.00");
  });

  describe("reference is generated correctly", () => {
    before(() => {
      const stub = sinon.stub(nanoid, "nanoid");
      stub.callsFake(() => "b33pb00p");
    });
    after(() => {
      sinon.restore();
    });

    const today = format(new Date(), "ddMMyyyy");
    const service = new PayService(server);

    test("{{PREFIX}} replacement is correct", () => {
      expect(
        service.referenceFromFees(["fee", "fii", "fo"], "{{PREFIX}}")
      ).to.equal("fee-fii-fo-b33pb00p");
      expect(service.referenceFromFees(["fee"], "FCDO-{{PREFIX}}")).to.equal(
        "FCDO-fee-b33pb00p"
      );
      expect(service.referenceFromFees([], "FCDO-{{PREFIX}}")).to.equal(
        "FCDO--b33pb00p"
      );
    });

    test("{{DATE*}} replacement is correct", () => {
      expect(service.referenceFromFees([], "FRIED-{{DATE}}")).to.equal(
        `FRIED-${today}-b33pb00p`
      );
      expect(service.referenceFromFees([], "{{DATE}}")).to.equal(
        `${today}-b33pb00p`
      );
      expect(service.referenceFromFees([], "{{DATE:}}")).to.equal(
        `${today}-b33pb00p`
      );

      expect(
        service.referenceFromFees(["fee", "fii", "fo"], "{{DATE}}")
      ).to.equal(`${today}-b33pb00p`);

      const yyyymmdd = format(new Date(), "yyyymmdd");
      expect(service.referenceFromFees([], "{{DATE:yyyymmdd}}")).to.equal(
        `${yyyymmdd}-b33pb00p`
      );

      const split = format(new Date(), "dd-mm-yyyy");
      expect(service.referenceFromFees([], "{{DATE:dd-mm-yyyy}}")).to.equal(
        `${split}-b33pb00p`
      );
    });

    test("combination replacement is correct", () => {
      expect(service.referenceFromFees([], "{{DATE}}-{{PREFIX}}")).to.equal(
        `${today}--b33pb00p`
      );
      expect(
        service.referenceFromFees(["scrambled"], "{{PREFIX}}-{{DATE}}")
      ).to.equal(`scrambled-${today}-b33pb00p`);

      expect(
        service.referenceFromFees(
          ["scrambled", "fried"],
          "EGGS:{{PREFIX}}-{{DATE}}"
        )
      ).to.equal(`EGGS:scrambled-fried-${today}-b33pb00p`);
    });

    test("no tags format is correct", () => {
      expect(service.referenceFromFees([], "FCDO")).to.equal("FCDO-b33pb00p");
    });
  });
});
