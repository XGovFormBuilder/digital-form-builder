import path from "path";
import { plugin } from ".";

import config from "../../config";
import { idFromFilename } from "./helpers";
import {
  loadPreConfiguredForms,
  FormConfiguration,
} from "./services/configuration-service";

type ConfigureEnginePlugin = (
  configFile?: string,
  customPath?: string
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

const relativeTo = __dirname;

export const configureEnginePlugin: ConfigureEnginePlugin = (
  configFile,
  customPath
) => {
  let configs: FormConfiguration[];

  if (configFile && customPath) {
    configs = [
      {
        configuration: require(path.join(customPath, configFile)),
        id: idFromFilename(configFile),
      },
    ];
  } else {
    configs = loadPreConfiguredForms();
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
