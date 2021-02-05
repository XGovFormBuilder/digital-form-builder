import React from "react";
import { useFeatures } from "../featureToggling";
import sinon from "sinon";

describe("FeatureToggleHook", () => {
  it("should return feature context value", () => {
    const mockContextValue = {
      featureA: false,
      featureB: true,
      featureC: true,
    };
    sinon.stub(React, "useContext").callsFake(function () {
      return mockContextValue;
    });
    const result = useFeatures();
    expect(result).toEqual(mockContextValue);
  });
});
