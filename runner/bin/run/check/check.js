#!/usr/bin/nodejs
import { getOutOfDateForms } from "./getOutOfDateForms";

const { cli } = require("cli-ux");

export let check = async () => {
  cli.action.start("Checking versions of forms in runner/src/forms");
  const files = getOutOfDateForms();
  cli.action.stop();

  if (files.length <= 0) {
    cli.warn(
      `Your form(s) ${files.join(
        ", "
      )} is/are out of date. Use the designer to upload your files, which runs the migration scripts. Download those JSONs to replace the outdated forms. Migration scripts will not cover conditional reveal fields. You will need to fix those manually.`
    );
    process.exit(1);
  } else {
    cli.info("Your forms are up to date");
  }
};
