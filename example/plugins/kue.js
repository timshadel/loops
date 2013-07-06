/**
 * Module dependencies
 */

var kue = require('kue')
  , redisurl = require('redisurl');

module.exports = function(opts) {

  kue.redis.createClient = function() {
    return redisurl(opts.redis);
  };

  var type = opts.type || 'deploy'
    , attempts = opts.attempts || 1
    , concurrency = opts.concurrency || 3
    , jobs = kue.createQueue();

  return function(app) {
    // TODO get notification email

    app.use('/kue', kue.app);

    app.enqueue(function(hook, done) {
      jobs
        .create(type, hook)
        .attempts(attempts)
        .on('complete', function() {
          // TODO notify
          console.log('done');
        })
        .on('failed', function() {
          // TODO notify
          console.log('failed');
        })
        .save(done);
    });

    jobs.process(type, concurrency, app.worker());
  };
};
