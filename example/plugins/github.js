/**
 * Module dependencies
 */

var spawn = require('child_process').spawn
  , exec = require('child_process').exec;

module.exports = function(opts) {

  var prefix = opts.prefix || '';

  return function(app) {
    app.parseWebhook(function(req, done) {
      done(null, {
        title: prefix+req.body.repository.name,
        sha: req.body.after,
        author: req.body.pusher.name,
        repo: req.body.repository.url,
        time: req.body.repository.pushed_at
      });
    });

    app.clone(function(job, log, done) {
      var clone = spawn('git', ['clone', job.repo, job.dir]);

      clone.stdout.setEncoding('utf8');
      clone.stderr.setEncoding('utf8');

      clone.stdout.on('data', log);
      clone.stderr.on('data', log);
      clone.on('close', function(code) {
        if (code !== 0) return done(new Error('git clone exited with status '+code));

        exec('git checkout -b deploy '+job.sha, {
          cwd: job.dir
        }, function(err, stdout, stderr) {
          log(stdout);
          if (err) return done(err);
          done();
        });
      });
    });
  };
};
