import "@testing-library/jest-dom";
import "./test/testServer";

beforeEach(() => {
  jest.resetAllMocks();
  expect.hasAssertions();
  document.body.innerHTML = `
    <div>
      <main id="root"></main>
      <div id="portal-root"></div>
    </div>
  `;
});
