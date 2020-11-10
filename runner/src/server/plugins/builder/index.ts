import fs from "fs";
import path from "path";
import { plugin } from "@xgovformbuilder/engine";

import config from "../../config";

const configPath = path.join(__dirname, "..", "..", "forms");
const relativeTo = __dirname;
const configFiles = fs.readdirSync(configPath).filter((filename) => {
  if (filename.indexOf(".json") >= 0) {
    return filename;
  }
});

const idFromFilename = (filename: string) => {
  return filename.replace(/govsite\.|\.json|/gi, "");
};

type ConfigurePlugins = (
  configFile: string,
  customPath: string
) => {
  plugin: any;
  options: {
    modelOptions: {
      relativeTo: string;
      previewMode: any;
    };
    configs: {
      configuration: any;
      id: string;
    }[];
    previewMode: boolean;
  };
};

export const configurePlugins: ConfigurePlugins = (configFile, customPath) => {
  let configs: {
    configuration: any;
    id: string;
  }[];

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
    previewMode: config.previewMode,
  };

  return {
    plugin,
    options: { modelOptions, configs, previewMode: config.previewMode },
  };
};
