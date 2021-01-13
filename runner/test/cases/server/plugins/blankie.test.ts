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
      connectSrc: ["self"],
      scriptSrc: ["self", "unsafe-inline"],
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
      connectSrc: ["self", "https://gov.uk/"],
      scriptSrc: ["self", "unsafe-inline", "https://gov.uk/piwik/piwik.js"],
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
