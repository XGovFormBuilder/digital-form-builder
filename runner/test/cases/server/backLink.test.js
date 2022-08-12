import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import cheerio from "cheerio";
import createServer from "src/server";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite(`BackLink`, () => {
  let server;

  // Create server before each test
  before(async () => {
    server = await createServer({
      formFileName: `back-link.json`,
      formFilePath: __dirname,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });
  test("Check back link text", async () => {
    const options = {
      method: "GET",
      url: `/back-link/first-page`,
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(200);
    expect(response.headers["content-type"]).to.include("text/html");

    const $ = cheerio.load(response.payload);

    expect($(".govuk-back-link").text()).to.equal("Back a page");
  });
});
