import { createServer } from "../../../createServer";

import { publish } from "../../../lib/publish";

jest.mock("../../../lib/publish");

describe("NewConfig tests", () => {
  const startServer = async (): Promise<hapi.Server> => {
    const server = await createServer();
    await server.start();
    return server;
  };

  let server;

  beforeAll(async () => {
    server = await startServer();
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };
    persistenceService.copyConfiguration = () => {
      return Promise.resolve([]);
    };
    persistenceService.uploadConfiguration = () => {
      return Promise.resolve([]);
    };
    persistenceService.getConfiguration = () => {
      return Promise.resolve([]);
    };
  });

  afterAll(async () => {
    await server.stop();
  });

  test("POST /api/new with special characters result in bad request", async () => {
    const options = {
      method: "post",
      url: "/api/new",
      payload: { name: "A *& B", selected: { Key: "New" } },
    };

    publish.mockImplementation(() => Promise.resolve([]));
    const res = await server.inject(options);

    expect(res.statusCode).toEqual(400);
    expect(
      res.result.indexOf("Form name should not contain special characters") > -1
    ).toEqual(true);
  });

  test("POST /api/new with existing form should not result in bad request", async () => {
    const options = {
      method: "post",
      url: "/api/new",
      payload: { name: "", selected: { Key: "Test" } },
    };

    publish.mockImplementation(() => Promise.resolve([]));
    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
  });

  test("POST /api/new with '-' should not result in bad request", async () => {
    const options = {
      method: "post",
      url: "/api/new",
      payload: { name: "a-b", selected: { Key: "New" } },
    };

    publish.mockImplementation(() => Promise.resolve([]));
    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
  });

  test("POST /api/new without runner running should result in bad request", async () => {
    const options = {
      method: "post",
      url: "/api/new",
      payload: { name: "a-b", selected: { Key: "New" } },
    };

    publish.mockImplementation(() => Promise.reject());
    const res = await server.inject(options);

    expect(res.statusCode).toEqual(401);
    expect(res.result).toMatch(
      "Designer could not connect to runner instance."
    );
  });
});
