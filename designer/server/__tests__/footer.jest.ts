import cheerio from "cheerio";

describe("Footer", () => {
  const OLD_ENV = process.env;

  const startServer = async (): Promise<any> => {
    const { createServer } = await import("../createServer");
    const server = await createServer();
    await server.start();
    return server;
  };

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("footer set is set by environmental variable", async () => {
    process.env = {
      ...OLD_ENV,
      FOOTER_TEXT: "Footer Text Test",
    };
    jest.resetModules();

    await import("../config");
    await import("../plugins/designer");

    const options = {
      method: "GET",
      url: `/app`,
    };

    const server = await startServer();
    const res = await server.inject(options);
    server.stop();

    const $ = cheerio.load(res.result);
    const footerText = $(".footer-message").find("p").text();
    expect(footerText).toEqual("Footer Text Test");
  });
});
