/**
 * Module dependencies
 */

var express = require('express')
  , proto = require('./application')
  , utils = require('./utils');

/**
 * Expose `createApplication()`
 */

exports = module.exports = createApplication;

/**
 * Create a loops application
 */

function createApplication(opts) {
  var app = express();
  utils.merge(app, proto);
  app.init(opts || {});
  return app;
};

/**
 * Expose express middleware
 */

exports.middleware = express;