import fs from "fs";
import path from "path";

import { idFromFilename } from "../helpers";

const FORMS_FOLDER = path.join(__dirname, "..", "..", "..", "forms");

export type FormConfiguration = {
  configuration: any; // TODO
  id: string;
};

export const loadPreConfiguredForms = (): FormConfiguration[] => {
  const configFiles = fs.readdirSync(FORMS_FOLDER).filter((filename) => {
    if (filename.indexOf(".json") >= 0) {
      return filename;
    }
  });

  return configFiles.map((configFile) => {
    const dataFilePath = path.join(FORMS_FOLDER, configFile);
    const configuration = require(dataFilePath);
    const id = idFromFilename(configFile);
    return { configuration, id };
  });
};
