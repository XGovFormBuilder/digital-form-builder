import createServer from "../../src/server";
import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";
import fs from "fs";

const opts = {
  chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  onlyCategories: ["accessibility"],
};

createServer({ formFileName: "components.json", formFilePath: __dirname })
  .then((server) => server.start())
  .then(() => {
    launchChromeAndRunLighthouse(
      "http://localhost:3009/components/all-components",
      { ...opts, output: "json" }
    ).then(() => {
      launchChromeAndRunLighthouse(
        "http://localhost:3009/components/all-components",
        { ...opts, output: "html" }
      ).then(() => {
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then((chrome) => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then((results) => {
        fs.writeFileSync(`./report.${opts.output}`, results.report);
        return chrome.kill().then(() => results.lhr);
      });
    });
}
