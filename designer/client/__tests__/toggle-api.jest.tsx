import { rest } from "msw";
import { FeatureToggleApi } from "../api/toggleApi";
import { server } from "../../test/testServer";

describe("Toggle API", () => {
  const url = "/feature-toggles";

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("Should fetch feature toggles", () => {
    const toggle = [{ ff_somevalue: "false" }];
    server.resetHandlers(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(toggle));
      })
    );
    return new FeatureToggleApi().fetch().then((data) => {
      expect(data).toStrictEqual(toggle);
    });
  });

  test("Should return nothing on server error", () => {
    server.resetHandlers(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json("Some error happened"));
      })
    );

    return new FeatureToggleApi().fetch().then((data) => {
      expect(data).toStrictEqual([]);
    });
  });

  test("Should return nothing with get exception", () => {
    server.resetHandlers(
      rest.get(url, (req, res, ctx) => {
        return res.networkError("Failed to connect");
      })
    );

    return new FeatureToggleApi().fetch().then((data) => {
      expect(data).toStrictEqual([]);
    });
  });
});
