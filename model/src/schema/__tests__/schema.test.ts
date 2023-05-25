// @ts-nocheck

import { Schema } from "../schema";

const baseConfiguration = {
  metadata: {},
  startPage: "/first-page",
  pages: [],
  lists: [],
  sections: [],
  conditions: [],
  fees: [],
  outputs: [],
  version: 2,
  skipSummary: false,
  phaseBanner: {},
};

test("allows feedback URL to be an empty string when feedbackForm is false", () => {
  const goodConfiguration = {
    ...baseConfiguration,
    feedbackForm: false,
    url: "",
    name: "Schema fix 3",
  };

  const { value, error } = Schema.validate(goodConfiguration, {
    abortEarly: false,
  });

  expect(error).toEqual(undefined);
});

describe("payment configuration", () => {
  test("top level payment configurations (payApiKey, paymentReferenceFormat, payReturnUrl) are valid", () => {
    const configuration = {
      ...baseConfiguration,
      paymentReferenceFormat: "EGGS-",
    };

    const { error } = Schema.validate(configuration, {
      abortEarly: false,
    });

    expect(error).toEqual(undefined);
  });

  test("feeOptions object creates itself from top level configurations if present", () => {
    const configuration = {
      ...baseConfiguration,
      paymentReferenceFormat: "EGGS-",
      payApiKey: "ab-cd",
    };

    const { value } = Schema.validate(configuration, {
      abortEarly: false,
    });

    expect(value.paymentReferenceFormat).toEqual("EGGS-");
    expect(value.payApiKey).toEqual("ab-cd");

    expect(value.feeOptions).toEqual({
      paymentReferenceFormat: "EGGS-",
      payApiKey: "ab-cd",
    });
  });

  test("values can be configured via feeOptions", () => {
    const configuration = {
      ...baseConfiguration,
      feeOptions: {
        paymentReferenceFormat: "EGGS-",
        payReturnUrl: "https://my.egg.service.scramble",
      },
    };

    const { value } = Schema.validate(configuration, {
      abortEarly: false,
    });

    expect(value.feeOptions).toEqual({
      paymentReferenceFormat: "EGGS-",
      payReturnUrl: "https://my.egg.service.scramble",
    });
  });

  test("feeOptions are not overwritten by top level configuration", () => {
    const configuration = {
      ...baseConfiguration,
      paymentReferenceFormat: "FRIED-",
      feeOptions: {
        paymentReferenceFormat: "EGGS-",
        payReturnUrl: "https://my.egg.service.scramble",
      },
    };

    const { value } = Schema.validate(configuration, {
      abortEarly: false,
    });

    expect(value.feeOptions).toEqual({
      paymentReferenceFormat: "EGGS-",
      payReturnUrl: "https://my.egg.service.scramble",
    });
  });
});
