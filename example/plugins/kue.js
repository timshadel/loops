/**
 * Module dependencies
 */

var kue = require('kue');

module.exports = function(opts) {

  var type = opts.type || 'build'
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
