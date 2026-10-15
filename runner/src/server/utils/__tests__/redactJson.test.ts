import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

import { redactJson } from "../redactJson";

suite("redactJson", () => {
  test("redacts an email field while leaving non-sensitive fields intact", async () => {
    const result = await redactJson({
      email: "jane.doe@nhs.net",
      formId: "rps-risk-report",
    });

    // "email" is in config.sensitiveLogKeys, so it's redacted by key, not by content.
    expect(result.email).to.equal("[SENSITIVE_FIELD]");
    expect(result.formId).to.equal("rps-risk-report");
  });

  test("redacts PII nested under a dynamically-named field, preserving surrounding text", async () => {
    const result = await redactJson({
      page: {
        answers: {
          customField123: { note: "please call 07700900123" },
        },
      },
    });

    expect(result.page.answers.customField123.note).to.match(
      /please call \[PHONE[^\]]*\]/
    );
  });

  test("passes through a value with no PII unchanged", async () => {
    const result = await redactJson({
      msg: "server started",
      pageIndex: 3,
      isComplete: true,
    });

    expect(result.msg).to.equal("server started");
    expect(result.pageIndex).to.equal(3);
    expect(result.isComplete).to.equal(true);
  });
});
