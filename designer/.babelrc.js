const path = require('path')
module.exports = {
  "presets": [
    ["@babel/preset-env",
      {
        "targets": {
          "node": "12"
        }
      }],
    "@babel/preset-flow",
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime",
    ["module-resolver", {
      "alias": {
        '@govuk-jsx': path.join( path.dirname(require.resolve('@xgovformbuilder/govuk-react-jsx')), '/govuk/components')
      }
    }]
  ],
  "exclude": [
    "node_modules",
    "../node_modules/**"
  ]
}
