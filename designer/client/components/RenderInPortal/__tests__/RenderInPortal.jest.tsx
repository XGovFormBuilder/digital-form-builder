import React from "react";
import { render } from "@testing-library/react";
import { RenderInPortal } from "../RenderInPortal";

describe("RenderInPortal", () => {
  let portalRoot: HTMLElement;

  // jest-setup.js recreates #portal-root before each test.
  beforeEach(() => {
    portalRoot = document.getElementById("portal-root")!;
  });

  test("renders a single component in the portal, and removes it on unmount", () => {
    const { unmount } = render(
      <RenderInPortal>
        <p id="test-paragraph">Test</p>
      </RenderInPortal>
    );

    expect(portalRoot.innerHTML).toBe(
      '<div><p id="test-paragraph">Test</p></div>'
    );

    unmount();
    expect(portalRoot.innerHTML).toBe("");
  });

  test("renders multiple components in parallel, and removes each on unmount", () => {
    const first = render(
      <RenderInPortal>
        <p id="test-paragraph1">Test 1</p>
      </RenderInPortal>
    );
    const second = render(
      <RenderInPortal>
        <p id="test-paragraph2">Test 2</p>
      </RenderInPortal>
    );

    expect(portalRoot.innerHTML).toBe(
      '<div><p id="test-paragraph1">Test 1</p></div><div><p id="test-paragraph2">Test 2</p></div>'
    );

    first.unmount();
    expect(portalRoot.innerHTML).toBe(
      '<div><p id="test-paragraph2">Test 2</p></div>'
    );

    second.unmount();
    expect(portalRoot.innerHTML).toBe("");
  });
});
