import { RenderInPortal } from "../components/RenderInPortal";
import React from "react";
import { render } from "@testing-library/react";

describe("Component RenderInPortal", () => {
  test("renders paragraph inside portal", () => {
    const page = render(
      <RenderInPortal>
        <p id="test-paragraph">Test</p>
      </RenderInPortal>
    );

    expect(page.getByText("Test")).toBeInTheDocument();
  });

  test("renders multiple portals in parallel", () => {
    const page = render(
      <div>
        <RenderInPortal>
          <p id="test-paragraph">Test 1</p>
        </RenderInPortal>
        <RenderInPortal>
          <p id="test-paragraph">Test 2</p>
        </RenderInPortal>
      </div>
    );

    expect(page.getByText("Test 1")).toBeInTheDocument();
    expect(page.getByText("Test 2")).toBeInTheDocument();
  });
});
