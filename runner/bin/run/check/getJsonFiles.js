import { FORM_PATH } from "./util";
import path from "path";
import { promises as fs } from "fs";

export const getJsonFiles = async () => {
  return (await fs.readdir(FORM_PATH)).filter(
    (file) => path.extname(file) === ".json"
  );
};
