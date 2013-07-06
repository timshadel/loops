/**
 * Module dependencies.
 */

var debug = require('simple-debug')('loops:hook')
  , os = require('os')
  , uid = require('websafe-uid');

module.exports = function(callbacks) {

  var parse = callbacks('parseWebhook')
    , enqueue = callbacks('enqueue');

  return function() {
    return function(req, res, next) {

      // parse the webhook payload
      parse(req, function(err, hook) {
        if (err) return next(err);
        res.send(200);

        // If we didn't get anything back it wasn't a valid request
        if (!hook) return;

        process.nextTick(function() {
          enqueue(hook);
        });
      });
    }
  };
}
