import Blankie from "blankie";
import { ServerRegisterPluginObject } from "@hapi/hapi";

type Config = {
  matomoUrl?: string;
};

export const configureBlankiePlugin = (
  config: Config
): ServerRegisterPluginObject<Blankie> => {
  return {
    plugin: Blankie,
    options: {
      connectSrc: (() =>
        ['self'].concat(
          config.matomoUrl ? [config.matomoUrl] : []
        ))(),
      defaultSrc: ['self'],
      fontSrc: ['self', 'data:'],
      scriptSrc: (() =>
        ['self', 'unsafe-inline'].concat(
          config.matomoUrl ? [config.matomoUrl + '/piwik/piwik.js'] : []
        ))(),
      styleSrc: ['self', 'unsafe-inline'],
      imgSrc: (() =>
        ['self'].concat(config.matomoUrl ? [config.matomoUrl] : []))(),
      generateNonces: false
    },
  };
};
