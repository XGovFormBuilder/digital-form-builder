// @ts-nocheck

import { Logger } from "../logger";

describe("logger", () => {
  const server = {
    log: jest.fn(),
  };
  const identifier = "MyIdentifier";
  const message = "My message";
  const logger = new Logger(server, identifier);

  afterEach(() => {
    server.log.mockClear();
  });

  test("should log an error level message", () => {
    logger.error(message);
    assertMessageLoggedAt("error");
  });

  test("should log a warn level message", () => {
    logger.warn(message);
    assertMessageLoggedAt("warn");
  });

  test("should log an info level message", () => {
    logger.info(message);
    assertMessageLoggedAt("info");
  });

  test("should log a debug level message", () => {
    logger.debug(message);
    assertMessageLoggedAt("debug");
  });

  function assertMessageLoggedAt(level) {
    expect(server.log.mock.calls.length).toEqual(1);
    expect(server.log.mock.calls[0][0]).toEqual([level, identifier]);
    expect(server.log.mock.calls[0][1]).toEqual(message);
  }
});
