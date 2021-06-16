import path from "path";
import resolve from "resolve";
import nunjucks from "nunjucks";
import vision from "vision";

import config from "../config";
import pkg from "../../../package.json";

const basedir = path.join(process.cwd(), "..");

export default {
  plugin: vision,
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment);

          return (context) => {
            if (context.nonce) {
              delete Object.assign(context, {
                script_nonce: context["script-nonce"],
              })["script-nonce"];
              delete Object.assign(context, {
                style_nonce: context.style_nonce,
              }).style_nonce;
            }

            const html = template.render(
              context /* , function (err, value) {
              console.error(err)
            } */
            );
            return html;
          };
        },
        prepare: (options, next) => {
          const environment = nunjucks.configure(options.path, {
            autoescape: true,
            watch: false,
          });
          environment.addFilter("isArray", (x) => Array.isArray(x));
          options.compileOptions.environment = environment;

          return next();
        },
      },
    },
    path: [
      /**
       * Array of directories to check for nunjucks templates.
       */
      `${path.join(__dirname, "..", "views")}`,
      `${path.join(__dirname, "engine", "views")}`,
      `${path.dirname(resolve.sync("govuk-frontend", { basedir }))}`,
      `${path.dirname(resolve.sync("govuk-frontend", { basedir }))}/components`,
      `${path.dirname(
        resolve.sync("hmpo-components", { basedir })
      )}/components`,
    ],
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: "/assets",
      serviceName: config.serviceName,
      feedbackLink: config.feedbackLink,
      pageTitle: config.serviceName + " - GOV.UK",
      analyticsAccount: config.analyticsAccount,
      matomoId: config.matomoId,
      matomoUrl: config.matomoUrl,
      BROWSER_REFRESH_URL: config.browserRefreshUrl,
      sessionTimeout: config.sessionTimeout,
      skipTimeoutWarning: false,
      serviceStartPage: config.serviceStartPage || "#",
      privacyPolicyUrl: config.privacyPolicyUrl || "#",
    },
  },
};
