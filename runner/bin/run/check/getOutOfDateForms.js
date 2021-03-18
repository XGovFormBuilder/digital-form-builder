import { getJsonFiles } from "./getJsonFiles";
import { FORM_PATH, CURRENT_SCHEMA_VERSION } from "./util";
import { promises as fs } from "fs";
import path from "path";

export const getOutOfDateForms = async () => {
  const files = await getJsonFiles();

  let needsMigration = [];

  for (const file of files) {
    const form = await fs.readFile(path.join(FORM_PATH, file));
    const version = JSON.parse(form).version || 0;
    version < CURRENT_SCHEMA_VERSION && needsMigration.push(file);
  }

  return needsMigration;
};
