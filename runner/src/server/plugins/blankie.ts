import Blankie from "blankie";
import { ServerRegisterPluginObject } from "@hapi/hapi";

import { isUrlSecure } from "src/server/utils/url";

type Config = {
  gtmId1?: string;
  gtmId2?: string;
  matomoUrl?: string;
};

type Google = {
  connectSrc: string[];
  fontSrc: string[];
  frameSrc: string[];
  imgSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
};

export const configureBlankiePlugin = (
  config: Config
): ServerRegisterPluginObject<Blankie> => {
  const { gtmId1, gtmId2, matomoUrl } = config;
  const google: Google = {
    connectSrc: [],
    fontSrc: [],
    frameSrc: [],
    imgSrc: [],
    scriptSrc: [],
    styleSrc: [],
  };
  const matomoSrc: string[] = [];
  const matomoScriptSrc: string[] = [];

  if (matomoUrl) {
    if (!isUrlSecure(matomoUrl)) {
      throw new Error(`Provided matomoUrl is insecure, please use https`);
    }

    matomoSrc.push(matomoUrl);
    matomoScriptSrc.push(
      new URL("/piwik/piwik.js", config.matomoUrl).toString()
    );
  }

  if (gtmId1 || gtmId2) {
    google.connectSrc.push(
      "www.google-analytics.com",
      "region1.google-analytics.com"
    );
    google.fontSrc.push("fonts.gstatic.com");
    google.frameSrc.push("www.googletagmanager.com");
    google.imgSrc.push(
      "www.gstatic.com",
      "ssl.gstatic.com",
      "www.googletagmanager.com",
      "region1.googletagmanager.com",
      "www.google-analytics.com",
      "region1.google-analytics.com"
    );
    google.scriptSrc.push(
      "www.google-analytics.com",
      "ssl.google-analytics.com",
      "region1.google-analytics.com",
      "stats.g.doubleclick.net",
      "www.googletagmanager.com",
      "region1.googletagmanager.com",
      "tagmanager.google.com",
      "www.gstatic.com",
      "ssl.gstatic.com"
    );
    google.styleSrc.push("fonts.googleapis.com", "tagmanager.google.com");
  }

  return {
    plugin: Blankie,
    options: {
      defaultSrc: ["self"],
      fontSrc: ["self", "data:", ...google.fontSrc],
      connectSrc: ["self", ...google.connectSrc, ...matomoSrc],
      scriptSrc: [
        "self",
        "unsafe-inline",
        ...google.scriptSrc,
        ...matomoScriptSrc,
      ],
      styleSrc: ["self", "unsafe-inline", ...google.styleSrc],
      imgSrc: ["self", ...google.imgSrc, ...matomoSrc],
      frameSrc: ["self", "data:", ...google.frameSrc],
      generateNonces: false,
    },
  };
};
