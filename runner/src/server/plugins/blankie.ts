import Blankie from "blankie";
import { ServerRegisterPluginObject } from "@hapi/hapi";

import { isUrlSecure } from "src/server/utils/url";

type Config = {
  matomoUrl?: string;
};

export const configureBlankiePlugin = (
  config: Config
): ServerRegisterPluginObject<Blankie> => {
  const { matomoUrl } = config;
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

  return {
    plugin: Blankie,
    options: {
      defaultSrc: ["self"],
      fontSrc: ["self", "data:"],
      connectSrc: ["self", ...matomoSrc],
      scriptSrc: ["self", "unsafe-inline", ...matomoScriptSrc],
      styleSrc: ["self", "unsafe-inline"],
      imgSrc: ["self", ...matomoSrc],
      generateNonces: false,
    },
  };
};
