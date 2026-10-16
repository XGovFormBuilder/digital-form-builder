import crypto from "crypto";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { createHmac, createHmacRaw, validateHmac } from "src/server/utils/hmac";
import { FrozenClock, freezeNow } from "../../../clock-helper";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

const key = "test-hmac-key";
const email = "manager@ukhsa.gov.uk";

suite("hmac", () => {
  let clock: FrozenClock | undefined;

  const setNow = (isoTime: string): FrozenClock => {
    clock?.restore();
    clock = freezeNow(isoTime);
    return clock;
  };

  afterEach(() => {
    clock?.restore();
    clock = undefined;
  });

  suite("magic links", () => {
    test("a link is valid until 20 minutes after it was sent", async () => {
      const now = setNow("2026-01-15T10:00:00Z");
      const [signature, requestTime] = await createHmac(email, key);

      now.tick(20 * 60 * 1000);
      expect(
        await validateHmac(email, signature, `${requestTime}`, key)
      ).to.equal({ isValid: true, reason: "valid" });

      now.tick(1000);
      expect(
        await validateHmac(email, signature, `${requestTime}`, key)
      ).to.equal({ isValid: false, reason: "expired" });
    });

    test("a link opened with a different email fails the signature check", async () => {
      setNow("2026-01-15T10:00:00Z");
      const [signature, requestTime] = await createHmac(email, key);

      expect(
        await validateHmac(
          "someone.else@ukhsa.gov.uk",
          signature,
          `${requestTime}`,
          key
        )
      ).to.equal({ isValid: false, reason: "invalid_signature" });
    });

    test("the expiry time shown in the email is 20 minutes after sending, in UK time", async () => {
      setNow("2026-01-15T10:00:00Z");
      expect((await createHmac(email, key))[2]).to.equal("10.20am");

      setNow("2026-01-15T13:45:00Z");
      expect((await createHmac(email, key))[2]).to.equal("2.05pm");

      setNow("2026-07-15T10:00:00Z");
      expect((await createHmac(email, key))[2]).to.equal("11.20am");
    });
  });

  suite("webhook and upload request signing", () => {
    test("the signature covers the message and time, with an expiry 20 minutes later", async () => {
      setNow("2026-01-15T10:00:00Z");
      const requestTime = Date.parse("2026-01-15T10:00:00Z") / 1000;

      const [signature, signedAt, expiresAt] = await createHmacRaw(
        "correlation-id",
        key
      );

      expect(signedAt).to.equal(requestTime);
      expect(signature).to.equal(
        crypto
          .createHmac("sha256", key)
          .update(`correlation-id${requestTime}`)
          .digest("hex")
      );
      expect(expiresAt).to.equal(requestTime + 20 * 60);
    });
  });
});
