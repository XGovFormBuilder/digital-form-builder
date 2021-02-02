import React from "react";
import { render } from "@testing-library/react";
import { Router } from "react-router-dom";
import { act } from "react-dom/test-utils";
import { FeatureFlagProvider } from "../FeatureFlagContext";
import { createMemoryHistory } from "history";
import sinon from "sinon";
import { FeatureToggleApi } from "../../api/toggleApi";
import FeatureToggle from "../../FeatureToggle";
import { useFeatures } from "../../hooks/featureToggling";
const history = createMemoryHistory();
history.push("");

const customRender = (ui, { providerProps, ...renderOptions }) => {
  const rendered = render(
    <Router history={history}>
      <FeatureFlagProvider value={providerProps}>{ui}</FeatureFlagProvider>
    </Router>,
    renderOptions
  );
  return {
    ...rendered,
    rerender: (ui, options) =>
      customRender(ui, { container: rendered.container, ...options }),
  };
};

describe("FeatureFlagContext", () => {
  beforeEach(() => {
    sinon.restore();
  });

  const WrappingComponent = ({ children }) => {
    return <FeatureFlagProvider>{children}</FeatureFlagProvider>;
  };

  test("should show element if feature is set", async () => {
    sinon
      .stub(FeatureToggleApi.prototype, "fetch")
      .callsFake(async function () {
        return { featureEditPageDuplicateButton: true };
      });

    const { findAllByText } = render(
      <WrappingComponent>
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    expect(await findAllByText("Johnny Five Is Alive!")).toBeTruthy();
  });

  test("should not show element if feature is not set", async () => {
    const stub = sinon
      .stub(FeatureToggleApi.prototype, "fetch")
      .callsFake(async function () {
        return { featureEditPageDuplicateButton: false };
      });

    const { queryAllByText } = render(
      <WrappingComponent>
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    await act(() => stub.getCall(0).returnValue);
    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });

  test("should not show element if feature is not defined", async () => {
    const stub = sinon
      .stub(FeatureToggleApi.prototype, "fetch")
      .callsFake(async function () {
        return { featureA: false };
      });

    const { queryAllByText } = render(
      <WrappingComponent>
        <FeatureToggle feature="featureB">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    await act(() => stub.getCall(0).returnValue);

    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });

  test("should feature toggle api only load once", async () => {
    const stub = sinon
      .stub(FeatureToggleApi.prototype, "fetch")
      .callsFake(async function () {
        return { featureA: false, featureB: true, featureC: true };
      });

    render(
      <WrappingComponent>
        <FeatureToggle feature="featureA">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
        <FeatureToggle feature="featureB">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
        <FeatureToggle feature="featureC">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    await act(() => stub.getCall(0).returnValue);

    expect(stub.calledOnce).toBeTruthy();
  });

  test("should not show element if features api fails", async () => {
    sinon.stub(FeatureToggleApi.prototype, "fetch").callsFake(function () {
      return new Promise((_resolve, reject) => {
        reject();
      });
    });

    const { queryAllByText } = render(
      <WrappingComponent>
        <FeatureToggle feature="featureEditPageDuplicateButton">
          <button>Johnny Five Is Alive!</button>
        </FeatureToggle>
      </WrappingComponent>
    );
    expect(await queryAllByText("Johnny Five Is Alive!")).toHaveLength(0);
  });

  it("should feature hook return feature context value", () => {
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
