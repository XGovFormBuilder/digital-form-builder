import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

beforeEach(() => {
  jest.resetAllMocks();
  expect.hasAssertions();
  fetchMock.enableMocks();
});
