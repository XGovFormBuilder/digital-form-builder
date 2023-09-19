describe("Config", () => {
  const OLD_ENV = { ...process.env };

  afterEach(() => {
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

  test("lastCommit and lastTag props are set correctly", async () => {
    process.env = {
      ...OLD_ENV,
      LAST_COMMIT: "LAST COMMIT",
      LAST_TAG: "LAST TAG",
    };

    jest.resetModules();

    const { default: config } = await import("../config");
    expect(config.lastCommit).toEqual("LAST COMMIT");
    expect(config.lastTag).toEqual("LAST TAG");
  });

  test("lastCommit and lastTag props are set correctly with GH variables", async () => {
    process.env = {
      ...OLD_ENV,
      LAST_COMMIT: "",
      LAST_TAG: "",
      LAST_COMMIT_GH: "LAST COMMIT",
      LAST_TAG_GH: "LAST TAG",
    };

    jest.resetModules();

    const { default: config } = await import("../config");
    expect(config.lastCommit).toEqual("LAST COMMIT");
    expect(config.lastTag).toEqual("LAST TAG");
  });

  test("Throws if S3 is required and no AWS config is found", async () => {
    process.env = {
      ...OLD_ENV,
      PERSISTENT_BACKEND: "s3",
      AWS_ACCESS_KEY_ID: undefined,
      AWS_ACCESS_SECRET_KEY: undefined,
    };
    jest.resetModules();
    try {
      import("../config");
    } catch (e) {
      expect(e).toBeTruthy();
    }

    process.env = {
      ...OLD_ENV,
      PERSISTENT_BACKEND: "s3",
      AWS_ACCESS_KEY_ID: "key",
      AWS_SECRET_ACCESS_KEY: "secret", // pragma: allowlist secret
    };
    jest.resetModules();
    await expect(import("../config")).resolves.toBeTruthy();
  });
});
