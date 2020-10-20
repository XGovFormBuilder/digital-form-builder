const Babel = require("@babel/core");
let internals = {};
internals.transform = function (content, filename) {
  const regexp = new RegExp("node_modules");
  if (regexp.test(filename)) {
    return content;
  }

  let transformed = Babel.transform(content, {
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
    filename: filename,
    sourceMap: "inline",
    sourceFileName: filename,
    auxiliaryCommentBefore: "$lab:coverage:off$",
    auxiliaryCommentAfter: "$lab:coverage:on$",
    plugins: ["@babel/plugin-transform-runtime"],
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
