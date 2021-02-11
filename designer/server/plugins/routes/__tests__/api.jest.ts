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
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET non-existing form data return correct new-form JSON", async () => {
    const options = {
      method: "get",
      url: "/api/test-form-id/data",
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
      version: 1,
    });
  });
});
