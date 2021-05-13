import "whatwg-fetch";
import { rest } from "msw";
import { setupServer } from "msw/node";

const mockedFormConfigurations = [
  {
    Key: "Not-a-feedback-form",
    DisplayName: "Not a feedback form",
    feedbackForm: false,
  },
  {
    Key: "My-feedback-form",
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

export { server, rest, mockedFormConfigurations };
