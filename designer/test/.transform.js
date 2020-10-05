const Babel = require('@babel/core')
let internals = {}

internals.transform = function (content, filename) {
  const regexp = new RegExp('node_modules')
  const isNodeModule = filename.indexOf('node_modules') > -1
  const isGovUKFrontend = filename.indexOf('govuk-frontend') > -1
  const isGovUKReactJsx = filename.indexOf('govuk-react-jsx') > -1

  if (isGovUKReactJsx) {
    return `
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, 'Textarea', {
        enumerable: true,
        get: function get() {
          return function Textarea() { return 'textarea' }
        }
      });
      Object.defineProperty(exports, 'Radios', {
        enumerable: true,
        get: function get() {
          return function Radios() { return 'radios' }
        }
      });
      Object.defineProperty(exports, 'Input', {
        enumerable: true,
        get: function get() {
          return function Input() { return 'input' }
        }
      });
      Object.defineProperty(exports, 'Hint', {
        enumerable: true,
        get: function get() {
          return function Hint() { return 'hint' }
        }
      });
      Object.defineProperty(exports, 'Select', {
        enumerable: true,
        get: function get() {
          return function Select() { return 'select' }
        }
      });
    `
  }

  if (isNodeModule) {
    return content
  }

  let transformed = Babel.transform(content, {
      presets: [    
        "@babel/preset-flow",
        ["@babel/preset-env", {
          "targets": {
            "node": "12"
          },
        }]
      ],
      filename: filename,
      sourceMap: 'inline',
      sourceFileName: filename,
      auxiliaryCommentBefore: '$lab:coverage:off$',
      auxiliaryCommentAfter: '$lab:coverage:on$',
      "plugins": [
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-private-property-in-object",
        "@babel/plugin-proposal-private-methods",
        "@babel/plugin-transform-runtime",
      ],
      "exclude": ["node_modules/**"],
      ignore: ['../node_modules', 'node_modules']
    })
  
  return transformed.code
}

internals.extensions = ['js', 'jsx', 'es', 'es6']
internals.methods = []
for (let i = 0, il = internals.extensions.length; i < il; ++i) {
  internals.methods.push({ ext: internals.extensions[i], transform: internals.transform })
}

module.exports = internals.methods
