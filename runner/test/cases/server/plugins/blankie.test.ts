import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { configureBlankiePlugin } from "src/server/plugins/blankie";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Server Blankie Plugin", () => {
  test("configuration options without matomo is correct", () => {
    const config = {};
    const { options } = configureBlankiePlugin(config);

    expect(options).to.equal({
      defaultSrc: ["self"],
      fontSrc: ["self", "data:"],
      connectSrc: ["self", "https://www.googletagmanager.com"],
      scriptSrc: ["self", "unsafe-inline", "https://www.googletagmanager.com"],
      styleSrc: ["self", "unsafe-inline"],
      imgSrc: ["self"],
      generateNonces: false,
    });
  });

  test("configuration options with matomo is correct", () => {
    const config = {
      matomoUrl: "https://gov.uk/",
    };

    const { options } = configureBlankiePlugin(config);

    expect(options).to.equal({
      defaultSrc: ["self"],
      fontSrc: ["self", "data:"],
      connectSrc: [
        "self",
        "https://www.googletagmanager.com",
        "https://gov.uk/",
      ],
      scriptSrc: [
        "self",
        "unsafe-inline",
        "https://www.googletagmanager.com",
        "https://gov.uk/piwik/piwik.js",
      ],
      styleSrc: ["self", "unsafe-inline"],
      imgSrc: ["self", "https://gov.uk/"],
      generateNonces: false,
    });
  });

  test("it throws when motomoUrl is invalid", () => {
    const config = {
      matomoUrl: "http://gov.uk",
    };

    expect(() => configureBlankiePlugin(config)).to.throw(
      Error,
      "Provided matomoUrl is insecure, please use https"
    );
  });
});
