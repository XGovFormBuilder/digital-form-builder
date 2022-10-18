#!/usr/bin/nodejs
const helper = require("./getOutOfDateForms");
const { CliUx } = require("@oclif/core");
async function check() {
  CliUx.ux.action.start("Checking versions of forms in runner/src/forms");
  const files = helper.getOutOfDateForms();
  CliUx.ux.action.stop();

  if (files.length <= 0) {
    CliUx.ux.warn(
      `Your form(s) ${files.join(
        ", "
      )} is/are out of date. Use the designer to upload your files, which runs the migration scripts. Download those JSONs to replace the outdated forms. Migration scripts will not cover conditional reveal fields. You will need to fix those manually.`
    );
    process.exit(1);
  } else {
    CliUx.ux.info("Your forms are up to date");
  }
}

module.exports = {
  check,
};
