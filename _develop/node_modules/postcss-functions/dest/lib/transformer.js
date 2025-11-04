"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformDecl = transformDecl;
exports.transformAtRule = transformAtRule;
exports.transformRule = transformRule;

var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));

var _helpers = require("./helpers.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function transformString(str, functions) {
  var promises = [];
  var values = (0, _postcssValueParser["default"])(str).walk(function (part) {
    promises.push(transformNode(part, functions));
  });
  if ((0, _helpers.hasPromises)(promises)) promises = Promise.all(promises);
  return (0, _helpers.then)(promises, function () {
    return values.toString();
  });
}

function transformNode(node, functions) {
  if (node.type !== 'function' || !Object.prototype.hasOwnProperty.call(functions, node.value)) return node;
  var func = functions[node.value];
  return (0, _helpers.then)(extractArgs(node.nodes, functions), function (args) {
    var invocation = func.apply(func, args);
    return (0, _helpers.then)(invocation, function (val) {
      node.type = 'word';
      node.value = val;
      return node;
    });
  });
}

function extractArgs(nodes, functions) {
  nodes = nodes.map(function (node) {
    return transformNode(node, functions);
  });
  if ((0, _helpers.hasPromises)(nodes)) nodes = Promise.all(nodes);
  return (0, _helpers.then)(nodes, function (values) {
    var args = [];
    var last = values.reduce(function (prev, node) {
      if (node.type === 'div' && node.value === ',') {
        args.push(prev);
        return '';
      }

      return prev + _postcssValueParser["default"].stringify(node);
    }, '');
    if (last) args.push(last);
    return args;
  });
}

function transformDecl(node, functions) {
  return (0, _helpers.then)(transformString(node.value, functions), function (value) {
    node.value = value;
  });
}

function transformAtRule(node, functions) {
  return (0, _helpers.then)(transformString(node.params, functions), function (value) {
    node.params = value;
  });
}

function transformRule(node, functions) {
  return (0, _helpers.then)(transformString(node.selector, functions), function (value) {
    node.selector = value;
  });
}