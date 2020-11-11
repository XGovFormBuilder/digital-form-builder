import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import cheerio from "cheerio";
import FormData from "form-data";
import createServer from "../../../src/server";

const { before, test, suite, after } = (exports.lab = Lab.script());

const configs = ["basic-v0", "basic-v1"];

configs.forEach((config) => {
  suite(`${config} requests`, () => {
    let server;

    // Create server before each test
    before(async () => {
      server = await createServer({
        data: `${config}.json`,
        customPath: __dirname,
      });
      await server.start();
    });

    after(async () => {
      await server.stop();
    });
    test("get request returns configured form page", async () => {
      const options = {
        method: "GET",
        url: `/${config}/start?visit=1`,
      };

      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.headers["content-type"]).to.include("text/html");

      const $ = cheerio.load(response.payload);

      expect($("h1.govuk-fieldset__heading").text().trim()).to.equal(
        "Licence details Which fishing licence do you want to get?"
      );
      expect($(".govuk-radios__item").length).to.equal(3);
    });

    test(
      "post requests redirects user to next form page",
      { timeout: 10000 },
      async () => {
        const form = new FormData();
        form.append("licenceLength", 1);
        const options = {
          method: "POST",
          url: `/${config}/start?visit=1`,
          headers: form.getHeaders(),
          payload: form.getBuffer(),
        };
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(302);
        expect(response.headers).to.include("location");
        expect(response.headers.location).to.equal(
          `/${config}/full-name?visit=1`
        );
      }
    );
  });
});
