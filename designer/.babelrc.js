const path = require('path')

module.exports = {
  "presets": [
    "@babel/preset-react",
    "@babel/typescript",
    ["@babel/preset-env",
      {
        "targets": {
          "node": "12"
        }
      }
    ],
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-export-default-from",
    ["module-resolver", {
      "alias": {
        "@govuk-jsx": path.join(path.dirname(require.resolve('@xgovformbuilder/govuk-react-jsx')), '/components'),
      }
    }]
  ],
  "exclude": [
    "node_modules",
    "../node_modules/**"
  ], 
  "sourceMaps": true
}
