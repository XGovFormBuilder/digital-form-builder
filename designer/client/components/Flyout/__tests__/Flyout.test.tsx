import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { useFlyoutEffect } from "../Flyout";
import { FlyoutContext } from "../../../context";
import sinon from "sinon";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, describe, beforeEach, afterEach } = lab;

function HookWrapper(props) {
  const hook = props.hook ? props.hook() : undefined;
  // @ts-ignore
  return <div hook={hook} />;
}

describe("useFlyoutContext", () => {
  let increment;
  let decrement;
  let wrapper;

  beforeEach(() => {
    sinon.restore();
    increment = sinon.stub();
    decrement = sinon.stub();
  });

  afterEach(() => {
    wrapper?.exists() && wrapper.unmount();
  });

  test("Increment is called on mount", () => {
    const flyoutContextProviderValue = { count: 0, increment, decrement };
    wrapper = mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: true })} />
      </FlyoutContext.Provider>
    );
    expect(increment.calledOnce).to.equal(true);
    expect(decrement.notCalled).to.equal(true);
  });

  test("Decrement is called on unmount", () => {
    const flyoutContextProviderValue = { count: 0, increment, decrement };
    wrapper = mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: true })} />
      </FlyoutContext.Provider>
    );

    wrapper.unmount();
    expect(increment.calledOnce).to.equal(true);
    expect(decrement.calledOnce).to.equal(true);
  });

  test.skip("flyout is offset by correct amount", () => {
    const flyoutContextProviderValue = {
      count: 1,
      increment,
      decrement,
    };
    expect(increment.notCalled).to.equal(true);
    wrapper = mount(
      <FlyoutContext.Provider value={flyoutContextProviderValue}>
        <HookWrapper hook={() => useFlyoutEffect({ show: true })} />
      </FlyoutContext.Provider>
    );

    const { hook } = wrapper.find("div").props();
    wrapper.mount();
    const { style } = hook;
    expect(increment.calledOnce).to.equal(true);

    expect(style).to.include({
      paddingLeft: "50px",
      transform: "translateX(-50px)",
      position: "relative",
    });
  });
});
