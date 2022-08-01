test.todo("RenderInPortal renders a single component in portal");
test.todo("RenderInPortal renders a multiple components in parallel");
/**
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

 */
