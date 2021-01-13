import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { RenderInPortal } from "../client/components/RenderInPortal";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Component RenderInPortal", () => {
  test("renders paragraph inside portal", () => {
    let portalRoot = document.querySelector("#portal-root");

    expect(portalRoot.innerHTML).to.equal("");

    const wrapper = mount(
      <RenderInPortal>
        <p id="test-paragraph">Test</p>
      </RenderInPortal>
    );
    portalRoot = document.querySelector("#portal-root");
    expect(portalRoot.innerHTML).to.equal(
      '<div><p id="test-paragraph">Test</p></div>'
    );

    wrapper.unmount();
    portalRoot = document.querySelector("#portal-root");
    expect(portalRoot.innerHTML).to.equal("");
  });

  test("renders multiple portals in parallel", () => {
    const wrapper1 = mount(
      <RenderInPortal>
        <p id="test-paragraph1">Test 1</p>
      </RenderInPortal>
    );
    const wrapper2 = mount(
      <RenderInPortal>
        <p id="test-paragraph2">Test 2</p>
      </RenderInPortal>
    );

    let portalRoot = document.querySelector("#portal-root");
    expect(portalRoot.innerHTML).to.equal(
      '<div><p id="test-paragraph1">Test 1</p></div><div><p id="test-paragraph2">Test 2</p></div>'
    );

    wrapper1.unmount();
    portalRoot = document.querySelector("#portal-root");
    expect(portalRoot.innerHTML).to.equal(
      '<div><p id="test-paragraph2">Test 2</p></div>'
    );

    wrapper2.unmount();
    portalRoot = document.querySelector("#portal-root");
    expect(portalRoot.innerHTML).to.equal("");
  });
});
