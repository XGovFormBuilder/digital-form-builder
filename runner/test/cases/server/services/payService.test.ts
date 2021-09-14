import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { PayService } from "server/services/payService";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Server PayService Service", () => {
  test("Currency formatted correctly in description", async () => {
    const service = new PayService();
    const result = service.descriptionFromFees({
      total: 3.5,
      details: [
        {
          description: "A",
          amount: "3.5",
        },
      ],
    });
    expect(result).to.equal("A: £3.50");
  });

  test("Currency formatted correctly in description with multipliers", async () => {
    const service = new PayService();
    const result = service.descriptionFromFees({
      total: 3.5,
      details: [
        {
          description: "A",
          amount: "3.5",
          multiplier: "numberOf",
          multiplyBy: 3,
        },
      ],
    });
    expect(result).to.equal("3 x A: £10.50");
  });

  test("Currency formatted correctly in description with multiple fees", async () => {
    const service = new PayService();
    const result = service.descriptionFromFees({
      total: 3.5,
      details: [
        {
          description: "A",
          amount: "3.5",
          multiplier: "numberOf",
          multiplyBy: 3,
        },
        {
          description: "B",
          amount: "150",
        },
      ],
    });
    expect(result).to.equal("3 x A: £10.50, B: £150.00");
  });
});
