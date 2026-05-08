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
        useBuiltIns: process.env.NODE_ENV === "test" ? false : "usage",
        corejs: process.env.NODE_ENV === "test" ? false : 3,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
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
