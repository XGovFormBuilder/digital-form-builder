import fs from "fs";
import path from "path";
import { plugin } from "@xgovformbuilder/engine";

import config from "../../config";
import { defaultPageController } from "./pages";

const configPath = path.join(__dirname, "..", "..", "forms");
const relativeTo = __dirname;
const configFiles = fs.readdirSync(configPath).filter((filename) => {
  if (filename.indexOf(".json") >= 0) {
    return filename;
  }
});

const idFromFilename = (filename) => {
  return filename.replace(/govsite\.|\.json|/gi, "");
};

export const configurePlugins = (configFile, customPath) => {
  let configs;
  if (configFile && customPath) {
    configs = [
      {
        configuration: require(path.join(customPath, configFile)),
        id: idFromFilename(configFile),
      },
    ];
  } else {
    configs = configFiles.map((configFile) => {
      const dataFilePath = path.join(configPath, configFile);
      const configuration = require(dataFilePath);
      // probably want to have basePath configurable in json also/instead
      const id = idFromFilename(configFile);
      return { configuration, id };
    });
  }
  const modelOptions = {
    relativeTo,
    defaultPageController,
    previewMode: config.previewMode,
  };

  return {
    plugin,
    options: { modelOptions, configs, previewMode: config.previewMode },
  };
};
