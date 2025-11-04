"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _transformer = require("./lib/transformer.js");

function plugin() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var functions = opts.functions || {};
  return {
    postcssPlugin: 'postcss-functions',
    AtRule: function AtRule(node) {
      return (0, _transformer.transformAtRule)(node, functions);
    },
    Declaration: function Declaration(node) {
      return (0, _transformer.transformDecl)(node, functions);
    },
    Rule: function Rule(node) {
      return (0, _transformer.transformRule)(node, functions);
    }
  };
}

plugin.postcss = true;
var _default = plugin;
exports["default"] = _default;
module.exports = exports.default;