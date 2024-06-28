import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import cheerio from "cheerio";
import createServer from "src/server";

const { before, after, describe, it } = (exports.lab = Lab.script());

let server;

before(async () => {
  server = await createServer({
    formFileName: `titles.json`,
    formFilePath: __dirname,
    options: { previewMode: true },
  });
  await server.start();
});

after(async () => {
  await server.stop();
});

describe("Title and section title", () => {
  it("does not render the section title if it is the same as the title", async () => {
    const options = {
      method: "GET",
      url: `/titles/applicant-one?visit=1`,
    };

    const response = await server.inject(options);
    const $ = cheerio.load(response.payload);

    expect($("#section-title").html()).to.be.null();
    expect($("h1").text().trim()).to.startWith("Applicant 1");
  });
  it("does render the section title if it is not the same as the title", async () => {
    const options = {
      method: "GET",
      url: `/titles/applicant-one-address?visit=1`,
    };

    const response = await server.inject(options);
    const $ = cheerio.load(response.payload);

    expect($("#section-title").text().trim()).to.be.equal("Applicant 1");
    expect($("h1.govuk-fieldset__heading").text().trim()).to.equal("Address");
  });
  it("renders the section title as H2, outside of the H1", async () => {
    const options = {
      method: "GET",
      url: `/titles/applicant-one-address?visit=1`,
    };

    const response = await server.inject(options);
    const $ = cheerio.load(response.payload);

    expect($("h1 #section-title").html()).to.be.null();
    expect($("h2#section-title")).to.exist();
  });

  it("Does not render the section title if hideTitle is set to true", async () => {
    const options = {
      method: "GET",
      url: `/titles/applicant-two?visit=1`,
    };

    const response = await server.inject(options);
    const $ = cheerio.load(response.payload);

    expect($("h1").text().trim()).to.startWith("Applicant 2 details");
    expect($("h2#section-title").html()).to.be.null();
  });
});
