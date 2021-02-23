import hapi from "@hapi/hapi";
import { createServer } from "../createServer";

describe("Server tests", () => {
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
  });

  afterAll(async () => {
    await server.stop();
  });

  test("accessibility statement page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/accessibility-statement`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf(
        '<h1 class="govuk-heading-xl">Accessibility Statement</h1>'
      ) > -1
    ).toEqual(true);
  });

  test("cookies page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/cookies`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf('<h1 class="govuk-heading-xl">Cookies</h1>') > -1
    ).toEqual(true);
  });

  test("terms and conditions page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/terms-and-conditions`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf(
        '<h1 class="govuk-heading-xl">Terms and conditions</h1>'
      ) > -1
    ).toEqual(true);
  });

  test("Phase banner is present", async () => {
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };

    const options = {
      method: "get",
      url: "/app",
    };

    const res = await server.inject(options);
    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf(
        '<strong class="govuk-tag govuk-phase-banner__content__tag">'
      ) > -1
    ).toEqual(true);
  });

  test("Phase banner is present", async () => {
    const options = {
      method: "get",
      url: "/app",
    };

    const res = await server.inject(options);
    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf(
        '<strong class="govuk-tag govuk-phase-banner__content__tag">'
      ) > -1
    ).toEqual(true);
  });

  test("Feature toggles api contains data", async () => {
    const options = {
      method: "get",
      url: "/feature-toggles",
    };

    const res = await server.inject(options);
    expect(res.statusCode).toEqual(200);
    expect(
      res.result.indexOf('{"featureEditPageDuplicateButton":false}') > -1
    ).toEqual(true);
  });

  test("security headers are present", async () => {
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };

    const options = {
      method: "get",
      url: "/app",
    };

    const res = await server.inject(options);
    expect(res.statusCode).toEqual(200);
    expect(res.headers["x-frame-options"]).not.toBeNull();
    expect(res.headers["x-content-type-options"]).not.toBeNull();
    expect(res.headers["x-frame-options"]).not.toBeNull();
  });
});
