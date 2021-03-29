import "@testing-library/jest-dom";
import "./test/testServer";
import { initI18n } from "./client/i18n";
initI18n();

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
