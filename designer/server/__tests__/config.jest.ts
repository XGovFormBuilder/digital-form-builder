describe("Config", () => {
  const OLD_ENV = process.env;

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("footerText prop is set correctly", async () => {
    process.env = {
      ...OLD_ENV,
      FOOTER_TEXT: "Footer Text Test",
    };
    jest.resetModules();

    const { default: config } = await import("../config");
    expect(config.footerText).toEqual("Footer Text Test");
  });
});
