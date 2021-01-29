const { createServer } = require("../../../createServer");

describe("App routes test", () => {
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
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET / should redirect to /app", async () => {
    const options = {
      method: "get",
      url: "/",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual("/app");
  });

  test("GET /app should serve designer landing page", async () => {
    const options = {
      method: "get",
      url: "/app",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
    expect(res.result.indexOf('<main id="root">') > -1).toEqual(true);
  });

  test("GET /app/* should serve designer landing page", async () => {
    const options = {
      method: "get",
      url: "/app/designer/test",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
    expect(res.result.indexOf('<main id="root">') > -1).toEqual(true);
  });

  test("GET /{id} should redirect to designer page", async () => {
    const options = {
      method: "get",
      url: "/test",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(301);
    expect(res.headers.location).toEqual("/app/designer/test");
  });

  test("GET /new should redirect to /app", async () => {
    const options = {
      method: "get",
      url: "/new",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(301);
    expect(res.headers.location).toEqual("/app");
  });
});
