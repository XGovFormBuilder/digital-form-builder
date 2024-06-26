const Babel = require("@babel/core");
let internals = {};
const path = require("path");

internals.transform = function (content, filename) {
  const regexp = new RegExp("node_modules");
  const isNodeModule = filename.indexOf("node_modules") > -1;
  const isGovUKFrontend = filename.indexOf("govuk-frontend") > -1;
  const isGovUKReactJsx = filename.indexOf("govuk-react-jsx") > -1;

  const stubber = (name) => {
    return `
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, '${name}', {
        enumerable: true,
        get: function get() {
          return function ${name}() { return '${name}' }
        }
      });
    `;
  };

  if (isGovUKReactJsx) {
    if (filename.includes("radios")) {
      return stubber("Radios");
    } else if (filename.includes("select")) {
      return stubber("Select");
    }
  }

  if (isNodeModule) {
    return content;
  }

  let transformed = Babel.transform(content, {
    presets: [
      "@babel/preset-react",
      "@babel/typescript",
      [
        "@babel/preset-env",
        {
          targets: {
            node: 12,
          },
        },
      ],
    ],
    filename: filename,
    sourceMap: "inline",
    sourceFileName: filename,
    auxiliaryCommentBefore: "$lab:coverage:off$",
    auxiliaryCommentAfter: "$lab:coverage:on$",
    plugins: [
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-private-property-in-object",
      "@babel/plugin-transform-private-methods",
      "@babel/plugin-transform-runtime",
      "@babel/plugin-syntax-dynamic-import",
      [
        "module-resolver",
        {
          alias: {
            "@govuk-jsx": path.join(
              path.dirname(require.resolve("@xgovformbuilder/govuk-react-jsx")),
              "/components"
            ),
          },
        },
      ],
      [
        "babel-plugin-transform-import-ignore",
        {
          patterns: [".css", ".scss", "wildcard/*/match.css"],
        },
      ],
    ],
    exclude: ["node_modules/**"],
    ignore: ["../node_modules", "node_modules"],
  });

  return transformed.code;
};

internals.extensions = [".js", ".jsx", ".ts", ".tsx", "es", "es6"];
internals.methods = [];
for (let i = 0, il = internals.extensions.length; i < il; ++i) {
  internals.methods.push({
    ext: internals.extensions[i],
    transform: internals.transform,
  });
}

module.exports = internals.methods;
