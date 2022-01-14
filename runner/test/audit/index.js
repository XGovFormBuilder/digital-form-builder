require("@babel/register")({
  presets: [
    "@babel/typescript",
    [
      "@babel/preset-env",
      {
        targets: {
          node: "12",
        },
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-property-in-object",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-transform-runtime",
  ],
});
require("./components");
