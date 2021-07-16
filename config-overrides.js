const {
  override,
  addBabelPlugins,
  addBabelPreset,
  babelInclude,
} = require("customize-cra");
const path = require("path");

console.log(path.resolve('node_modules/raiden-ts'))

module.exports = override(
  addBabelPreset("@babel/preset-typescript"),
  addBabelPlugins(
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-syntax-optional-chaining",
    "@babel/plugin-proposal-optional-chaining"
  ),
  babelInclude([
    path.resolve("src"), // make sure you link your own source
    path.resolve("node_modules/raiden-ts"),
  ]),
);
