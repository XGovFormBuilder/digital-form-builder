import path from "path";
import resolve from "resolve";
import nunjucks from "nunjucks";
import vision from "vision";

import pkg from "../../package.json";

const basedir = path.join(process.cwd(), "..");

export const viewPlugin = {
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
          options.compileOptions.environment = nunjucks.configure(
            options.path,
            {
              autoescape: true,
              watch: false,
            }
          );

          return next();
        },
      },
    },
    path: [
      `${path.join("dist", "client", "views")}`,
      `${path.join(__dirname, "..", "views")}`,
      `${path.dirname(resolve.sync("govuk-frontend", { basedir }))}`,
      `${path.dirname(resolve.sync("govuk-frontend", { basedir }))}/components`,
    ],
    context: {
      appVersion: pkg.version,
      assetPath: "/assets",
    },
  },
};
