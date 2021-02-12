import React from "react";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { FeatureFlagContext, FeatureFlagProvider } from "../FeatureFlagContext";
import sinon from "sinon";
import { FeatureToggleApi } from "../../api/toggleApi";
import FeatureToggle from "../../FeatureToggle";

describe("FeatureFlagContext", () => {
  beforeEach(() => {
    sinon.restore();
  });

  const WrappingComponent = ({ value, children }) => {
    return (
      <FeatureFlagContext.Provider value={value}>
        {children}
      </FeatureFlagContext.Provider>
    );
  };

  test("should show element if feature is set", async () => {
    const { findAllByText } = render(
      <WrappingComponent value={{ featureEditPageDuplicateButton: true }}>
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    expect(await findAllByText("Johnny Five Is Alive!")).toBeTruthy();
  });

  test("should not show element if feature is not set", async () => {
    const { queryAllByText } = render(
      <WrappingComponent value={{ featureEditPageDuplicateButton: false }}>
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });

  test("should not show element if feature is not defined", async () => {
    const { queryAllByText } = render(
      <WrappingComponent value={{ featureA: false }}>
        <FeatureToggle feature="featureB">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );

    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });

  test("should feature toggle api only load once", async () => {
    const stub = sinon
      .stub(FeatureToggleApi.prototype, "fetch")
      .callsFake(async function () {
        return { featureA: false, featureB: true, featureC: true };
      });

    render(
      <FeatureFlagProvider>
        <FeatureToggle feature="featureA">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
        <FeatureToggle feature="featureB">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
        <FeatureToggle feature="featureC">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </FeatureFlagProvider>
    );
    await act(() => stub.getCall(0).returnValue);

    expect(stub.calledOnce).toBeTruthy();
  });

  test("should not show element if features api fails", async () => {
    const { queryAllByText } = render(
      <WrappingComponent
        value={() => {
          return new Promise((_resolve, reject) => {
            reject();
          });
        }}
      >
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });
});
