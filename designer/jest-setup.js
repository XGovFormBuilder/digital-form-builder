import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import "whatwg-fetch";

beforeEach(() => {
  jest.resetAllMocks();
  expect.hasAssertions();
  fetchMock.enableMocks();
});
