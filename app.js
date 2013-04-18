/**
 * Module dependencies.
 */
var stack = require('simple-stack-api')
  , errorHandler = require('./lib/errorHandler');

/**
 * Expose the app
 */
var app = module.exports = stack();

// Our own error handler
app.replace('errorHandler', errorHandler());
