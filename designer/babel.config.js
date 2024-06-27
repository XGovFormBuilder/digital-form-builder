const path = require("path");

const reactJsxPath = path.join(
  path.dirname(require.resolve("@xgovformbuilder/govuk-react-jsx")),
  "/components"
);

module.exports = {
  sourceType: "unambiguous", // https://github.com/webpack/webpack/issues/4039#issuecomment-564812879
  presets: [
    "@babel/typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        debug: false,
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-private-methods",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-transform-logical-assignment-operators",
    "@babel/plugin-transform-optional-chaining",
    [
      "module-resolver",
      {
        alias: {
          "@govuk-jsx": reactJsxPath,
        },
      },
    ],
  ],
};
