/**
 * Module dependencies.
 */

var debug = require('simple-debug')('loops:application')
  , hook = require('./hook')
  , worker = require('./worker')
  , express = require('express');

/**
 * Application prototype.
 *
 * @api private
 */

var app = exports = module.exports = {};

/**
 * Initialize the server.
 *
 * @api private
 */

app.init = function() {
  this.callbacks = {};
  this.defaultConfiguration();
};

/**
 * Initialize application configuration.
 *
 * @param {Object} opts
 * @api private
 */

app.defaultConfiguration = function() {
  var self = this
    , callbacks = self.callback.bind(self);

  // default settings
  self.disable('x-powered-by');

  // Setup our loops modules
  var webhook = hook(callbacks);

  this._worker = worker(callbacks);

  // Add our middleware
  self
    .use(express.bodyParser())
    .use(self.router);

  // Hook
  self
    .post('/webhook', webhook());

};

/**
 * Get a callback function that has been registered
 *
 * @param {String} name
 * @param {Function} defaultCb
 * @return {Function}
 * @api private
 */

app.callback = function(name, defaultCb) {
  var self = this;

  // Create a proxy function so we can return a callback
  // before it's actually defined
  return function() {
    debug('calling callback', name);
    var cb = self.callbacks[name] || defaultCb;
    if (cb) return cb.apply(null, arguments);

    // Pass an error to the provided callback
    var done = arguments[arguments.length - 1];
    done(new Error("'"+name+"' callback not implemented"));
  };
};

/**
 * Register a callback for parsing a webhook
 *
 * @param {Function} fn
 * @api public
 */

app.parseWebhook = function(fn) {
  debug('registering callback parseWebhook');
  this.callbacks.parseWebhook = fn;
  return this;
};

/**
 * Register a callback for enqueue'ing job
 *
 * @param {Function} fn
 * @api public
 */

app.enqueue = function(fn) {
  debug('registering callback enqueue');
  this.callbacks.enqueue = fn;
  return this;
};

/**
 * Register a callback for listing the valid environments
 *
 * @param {Function} fn
 * @api public
 */

app.environments = function(fn) {
  debug('registering callback environments');
  this.callbacks.environments = fn;
  return this;
};

/**
 * Register a callback for cloning a repo
 *
 * @param {Function} fn
 * @api public
 */

app.clone = function(fn) {
  debug('registering callback clone');
  this.callbacks.clone = fn;
  return this;
};

/**
 * Register a callback for initializing an application
 *
 * @param {Function} fn
 * @api public
 */

app.initApp = function(fn) {
  debug('registering callback initApp');
  this.callbacks.initApp = fn;
  return this;
};

/**
 * Register a callback for deploying an application
 *
 * @param {Function} fn
 * @api public
 */

app.deploy = function(fn) {
  debug('registering callback deploy');
  this.callbacks.deploy = fn;
  return this;
};

/**
 * Register a plugin that can register multiple callbacks
 *
 * The plugin function will be called with the app as the single argument.
 * The plugin can proceed to register callbacks that the plugin needs.
 *
 *     app.plugin(function(app){
 *       // Register the callbacks here
 *     });
 *
 * A common pattern will include a function that customizes the plugin
 * and returns a closure
 *
 *     function myPlugin (options) {
 *       // maybe set some defaults here
 *       return function(app) {
 *         // Register the callbacks here with options
 *       }
 *     }
 *
 *     app.plugin(myPlugin({
 *       option1: 'foo',
 *       option2: 'bar'
 *     }));
 *
 * @param {Function} plugin
 * @api public
 */

app.plugin = function(plugin) {
  return plugin(this);
};

/**
 * Get a worker function
 *
 * @api public
 */

app.worker = function() {
  debug('getting a worker function');
  return this._worker;
};
