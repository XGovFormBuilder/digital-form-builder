const { cli } = require("cli-ux");
const fs = require("fs").promises;
const path = require("path");
const CURRENT_SCHEMA_VERSION = 2;
const FORM_PATH = path.join(process.cwd(), "src", "server", "forms");

async function check() {
  cli.action.start("Checking versions of forms in runner/src/forms");
  const files = await fs.readdir(FORM_PATH);
  const forms = (await files).filter((file) => path.extname(file) === ".json");

  const needsMigration = forms.filter(async (file) => {
    const form = await fs.readFile(path.join(FORM_PATH, file));
    const version = JSON.parse(form).version || 0;
    return version < CURRENT_SCHEMA_VERSION;
  });
  cli.action.stop();

  if (needsMigration.length > 0) {
    cli.warn(
      `Your form(s) ${needsMigration.join(
        ", "
      )} are out of date. Use the designer to upload your files, which runs the migration scripts. Download those JSONs to replace the outdated forms. Migration scripts will not cover conditional reveal fields. You will need to fix those manually.`
    );
  } else {
    cli.info("Your forms are up to date");
  }
}

check();
