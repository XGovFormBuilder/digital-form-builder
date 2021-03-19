const helper = require("./getJsonFiles");
const { FORM_PATH, CURRENT_SCHEMA_VERSION } = require("./util");
const fs = require("fs").promises;
const path = require("path");

async function getOutOfDateForms() {
  const files = await helper.getJsonFiles();
  let needsMigration = [];

  for (const file of files) {
    const form = await fs.readFile(path.join(FORM_PATH, file));
    const version = JSON.parse(form).version || 0;
    version < CURRENT_SCHEMA_VERSION && needsMigration.push(file);
  }

  return needsMigration;
}

module.exports = {
  getOutOfDateForms,
};
