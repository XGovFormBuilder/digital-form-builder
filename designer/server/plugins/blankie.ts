import Blankie from "blankie";
import { ServerRegisterPluginObject } from "@hapi/hapi";

export const configureBlankiePlugin = (): ServerRegisterPluginObject<
  Blankie
> => {
  return {
    plugin: Blankie,
    options: {
      defaultSrc: ["self"],
      fontSrc: ["self", "data:"],
      connectSrc: ["self"],
      scriptSrc: [
        "self",
        "unsafe-inline",
        "unsafe-eval",
        "https://unpkg.com/react@16/umd/react.development.js",
        "https://unpkg.com/react-dom@16/umd/react-dom.development.js",
      ],
      styleSrc: ["self"],
      imgSrc: ["self", "data:"],
      generateNonces: false,
    },
  };
};
