import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import cheerio from "cheerio";
import createServer from "src/server";

const { test, suite, afterEach } = (exports.lab = Lab.script());

suite(`Phase banner`, () => {
  let server;

  afterEach(async () => {
    await server.stop();
  });

  test("shows the beta tag by default", async () => {
    // For backwards-compatibility, as the main layout template currently always shows 'beta'.
    // TODO: default to no phase banner? TBD
    server = await createServer({
      formFileName: `phase-default.json`,
      formFilePath: __dirname + "/forms",
    });
    await server.start();

    const options = {
      method: "GET",
      url: `/phase-default/first-page`,
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(200);

    const $ = cheerio.load(response.payload);

    expect($(".govuk-phase-banner__content__tag").text().trim()).to.equal(
      "beta"
    );
  });

  test("shows the alpha tag if selected", async () => {
    server = await createServer({
      formFileName: `phase-alpha.json`,
      formFilePath: __dirname + "/forms",
    });
    await server.start();

    const options = {
      method: "GET",
      url: `/phase-alpha/first-page`,
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(200);

    const $ = cheerio.load(response.payload);

    expect($(".govuk-phase-banner__content__tag").text().trim()).to.equal(
      "alpha"
    );
  });

  test("does not show the phase banner if None", async () => {
    server = await createServer({
      formFileName: `phase-none.json`,
      formFilePath: __dirname + "/forms",
    });
    await server.start();

    const options = {
      method: "GET",
      url: `/phase-none/first-page`,
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(200);

    const $ = cheerio.load(response.payload);

    expect($(".govuk-phase-banner").html()).to.equal(null);
  });
});
