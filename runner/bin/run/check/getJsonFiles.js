const { FORM_PATH } = require("./util");
const path = require("path");
const fs = require("fs").promises;

async function getJsonFiles() {
  return (await fs.readdir(FORM_PATH)).filter(
    (file) => path.extname(file) === ".json"
  );
}

module.exports = {
  getJsonFiles,
};
