import { createServer } from "../../../createServer";

jest.mock("@hapi/wreck", () => ({
  get: async () => ({
    payload: {
      toString: () => "{}",
    },
  }),
  /*post: async () => ({
    payload: {
      toString: () => "{}",
    },
  }),*/
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

  test("PUT should place error on session", async () => {
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
});
