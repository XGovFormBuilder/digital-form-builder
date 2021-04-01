import { createServer } from "../../../createServer";

jest.mock("@hapi/wreck", () => ({
  get: async () => ({
    payload: {
      toString: () => "{}",
    },
  }),
}));

describe("Server API", () => {
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

  test("GET non-existing form data return correct new-form JSON", async () => {
    const options = {
      method: "get",
      url: "/api/test-form-id/data",
      payload: { name: "A *& B", selected: { Key: "New" } },
    };

    const { result } = await server.inject(options);

    expect(result).toEqual({
      metadata: {},
      startPage: "/first-page",
      pages: [
        {
          title: "First page",
          path: "/first-page",
          components: [],
          next: [
            {
              path: "/second-page",
            },
          ],
        },
        {
          path: "/second-page",
          title: "Second page",
          components: [],
          next: [
            {
              path: "/summary",
            },
          ],
        },
        {
          title: "Summary",
          path: "/summary",
          controller: "./pages/summary.js",
          components: [],
        },
      ],
      lists: [],
      sections: [],
      conditions: [],
      fees: [],
      outputs: [],
      version: 2,
    });
  });

  test("Failure to communicate with Runner should place error on session", async () => {
    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        sections: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    const result = await server.inject(options);
    expect(result.statusCode).toEqual(401);

    const optionsCrash = {
      method: "get",
      url: "/error/crashreport/test-form-id",
    };
    const resultCrash = await server.inject(optionsCrash);
    expect(resultCrash.headers["content-disposition"]).toContain(
      "attachment; filename=test-form-id-crash-report"
    );
  });

  test("Schema validation failures should return 401", async () => {
    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    const result = await server.inject(options);
    expect(result.statusCode).toEqual(401);
    expect(result.result.err.message).toMatch("Schema validation failed");
  });

  test("persistence service errors should return 401", async () => {
    //Given
    const { persistenceService } = server.services();
    persistenceService.uploadConfiguration = () => {
      return Promise.reject(new Error("Error in persistence service"));
    };

    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        sections: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    //When
    const result = await server.inject(options);

    //Then
    expect(result.statusCode).toEqual(401);
    expect(result.result.err.message).toEqual("Error in persistence service");
  });
});
