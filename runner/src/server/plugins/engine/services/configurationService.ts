import fs from "fs";
import path from "path";

import { idFromFilename } from "../helpers";

const FORMS_FOLDER = path.join(__dirname, "..", "..", "..", "forms");

export type FormConfiguration = {
  configuration: any; // TODO
  id: string;
};

/**
 * Reads the runner/src/server/forms directory for JSON files. The forms that are found will be loaded up at localhost:3009/id
 */
export const loadPreConfiguredForms = (): FormConfiguration[] => {
  const configFiles = fs
    .readdirSync(FORMS_FOLDER)
    .filter((filename: string) => filename.indexOf(".json") >= 0);

  return configFiles.map((configFile) => {
    const dataFilePath = path.join(FORMS_FOLDER, configFile);
    const configuration = require(dataFilePath);
    const id = idFromFilename(configFile);
    return { configuration, id };
  });
};
