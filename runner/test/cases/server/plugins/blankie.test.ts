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
      frameSrc: ["self", "data:"],
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
      frameSrc: ["self", "data:"],
      connectSrc: ["self", "https://gov.uk/"],
      scriptSrc: ["self", "unsafe-inline", "https://gov.uk/piwik/piwik.js"],
      styleSrc: ["self", "unsafe-inline"],
      imgSrc: ["self", "https://gov.uk/"],
      generateNonces: false,
    });
  });

  test("configuration options with GTM (1) is correct", () => {
    const config = {
      gtmId2: "ABC",
    };

    const { options } = configureBlankiePlugin(config);

    expect(options).to.equal({
      defaultSrc: ["self"],
      fontSrc: ["self", "data:", "fonts.gstatic.com"],
      frameSrc: ["self", "data:", "www.googletagmanager.com"],
      connectSrc: [
        "self",
        "www.google-analytics.com",
        "region1.google-analytics.com",
      ],
      scriptSrc: [
        "self",
        "unsafe-inline",
        "www.google-analytics.com",
        "ssl.google-analytics.com",
        "region1.google-analytics.com",
        "stats.g.doubleclick.net",
        "www.googletagmanager.com",
        "region1.googletagmanager.com",
        "tagmanager.google.com",
        "www.gstatic.com",
        "ssl.gstatic.com",
      ],
      styleSrc: [
        "self",
        "unsafe-inline",
        "fonts.googleapis.com",
        "tagmanager.google.com",
      ],
      imgSrc: [
        "self",
        "www.gstatic.com",
        "ssl.gstatic.com",
        "www.googletagmanager.com",
        "region1.googletagmanager.com",
        "www.google-analytics.com",
        "region1.google-analytics.com",
      ],
      generateNonces: false,
    });
  });

  test("configuration options with GTM (2) is correct", () => {
    const config = {
      gtmId2: "ABC",
    };

    const { options } = configureBlankiePlugin(config);

    expect(options).to.equal({
      defaultSrc: ["self"],
      fontSrc: ["self", "data:", "fonts.gstatic.com"],
      frameSrc: ["self", "data:", "www.googletagmanager.com"],
      connectSrc: [
        "self",
        "www.google-analytics.com",
        "region1.google-analytics.com",
      ],
      scriptSrc: [
        "self",
        "unsafe-inline",
        "www.google-analytics.com",
        "ssl.google-analytics.com",
        "region1.google-analytics.com",
        "stats.g.doubleclick.net",
        "www.googletagmanager.com",
        "region1.googletagmanager.com",
        "tagmanager.google.com",
        "www.gstatic.com",
        "ssl.gstatic.com",
      ],
      styleSrc: [
        "self",
        "unsafe-inline",
        "fonts.googleapis.com",
        "tagmanager.google.com",
      ],
      imgSrc: [
        "self",
        "www.gstatic.com",
        "ssl.gstatic.com",
        "www.googletagmanager.com",
        "region1.googletagmanager.com",
        "www.google-analytics.com",
        "region1.google-analytics.com",
      ],
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
