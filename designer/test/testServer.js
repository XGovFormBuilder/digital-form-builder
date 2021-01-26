import "whatwg-fetch";
import { rest } from "msw";
import { setupServer } from "msw/node";

const mockedFormConfigurations = [
  {
    Key: "test",
    DisplayName: "Not a feedback form",
    feedbackForm: false,
  },
  {
    Key: "UKPrecgQUv",
    DisplayName: "My feedback form",
    feedbackForm: true,
  },
];

const server = setupServer(
  rest.get("/api/configurations", (_req, res, ctx) => {
    return res(ctx.json(mockedFormConfigurations));
  }),

  rest.get("*", (req, res, ctx) => {
    console.error(`Please add request handler for ${req.url.toString()}`);
    return res(
      ctx.status(500),
      ctx.json({ error: "You must add request handler." })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

export { server, rest, mockedFormConfigurations };
