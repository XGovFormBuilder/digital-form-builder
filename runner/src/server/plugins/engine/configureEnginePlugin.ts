import path from "path";
import { plugin } from "./plugin";

import {
  loadPreConfiguredForms,
  FormConfiguration,
} from "./services/configurationService";
import { idFromFilename } from "./helpers";
import config from "../../config";
import { FormDefinition } from "@xgovformbuilder/model";


const relativeTo = __dirname;

type EngineOptions = {
  previewMode?: boolean;
};
export const configureEnginePlugin = (
  formFileName,
  formFilePath,
  options?: EngineOptions
) => {
  let configs: FormConfiguration[];

  if (formFileName && formFilePath) {
    configs = [
      {
        configuration: require(path.join(
          formFilePath,
          formFileName
        )) as FormDefinition,
        id: idFromFilename(formFileName),
      },
    ];
  } else {
    configs = loadPreConfiguredForms();
  }

  const modelOptions = {
    relativeTo,
    previewMode: options?.previewMode ?? config.previewMode,
  };

  return {
    plugin,
    options: { modelOptions, configs, previewMode: config.previewMode },
  };
};
