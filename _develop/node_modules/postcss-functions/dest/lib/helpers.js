"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPromise = isPromise;
exports.hasPromises = hasPromises;
exports.then = then;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isPromise(obj) {
  return !!obj && (_typeof(obj) === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function hasPromises(arr) {
  return arr.length && arr.some(function (item) {
    return isPromise(item);
  });
}

function then(promiseOrResult, onFulfilled) {
  if (isPromise(promiseOrResult)) return promiseOrResult.then(onFulfilled);
  return onFulfilled(promiseOrResult);
}