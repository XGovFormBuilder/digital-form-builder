// @ts-nocheck

import { Schema } from "../schema";

describe("Form schema", () => {
  test("allows feedback URL to be an empty string when feedbackForm is false", () => {
    const goodConfiguration = {
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
      name: "Schema fix 3",
      feedback: { feedbackForm: false, url: "" },
      phaseBanner: {},
      authCheck: false,
    };

    const { value, error } = Schema.validate(goodConfiguration, {
      abortEarly: false,
    });

    expect(error).toEqual(undefined);
  });
});
