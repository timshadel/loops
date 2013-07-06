/**
 * Module dependencies
 */

var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , superagent = require('superagent');

module.exports = function(opts) {

  return function(app) {
    var environments = app.callback('environments');

    function push(env, job, log, done) {
      updateRemotes(env, job, function(err) {
        if (err) return done(err);

        forceUpdate(job, function(err) {
          if (err) return done(err);
          var gpush = spawn('git', ['push', 'heroku', 'deploy:master', '-f'], {cwd: job.dir});

          gpush.stdout.setEncoding('utf8');
          gpush.stderr.setEncoding('utf8');

          gpush.stdout.on('data', log);
          gpush.stderr.on('data', log);

          gpush.on('close', function(code) {
            if (code !== 0) return done(new Error('`git push` exited with status '+code));
            done();
          });
        });
      });
    };

    function promote(env, downstream, job, log, done) {
      updateRemotes(env, job, function(err) {
        if (err) return done(err);

        pipeline(opts, env, downstream, job, log, done);
      });
    };

    app.initApp(function(job, log, done) {
      environments(job, log, function(err, envs) {
        if (err) return done(err);

        // TODO initialize apps if they don't exist in heroku
        done();      
      });
    });

    app.deploy(function(env, job, log, done) {
      environments(job, log, function(err, envs) {
        if (err) return done(err);

        var index = envs.indexOf(env);

        if (index === 0) push(env, job, log, done);
        // Send the env before
        else promote(envs[index-1], envs[index], job, log, done);
      });
    });
  };
};

function updateRemotes (env, job, done) {
  // Remove any previous remotes
  exec('git remote rm heroku', {cwd: job.dir}, function(err, stdout, stderr) {
    // Ignore the error
    var remote = 'git@heroku.com:'+appname(env, job)+'.git';
    // Add our current remote
    exec('git remote add heroku '+remote, {cwd: job.dir}, function(err, stdout, stderr) {
      if (err) return done(err);
      done();
    });
  });
};

function forceUpdate(job, done) {
  // Force a new hash without changing the content
  exec('git commit --amend --no-edit', {cwd: job.dir}, function(err, stdout, stderr) {
    if (err) return done(err);
    done();
  });
};

function pipeline(opts, env, downstream, job, log, done) {
  var key = opts.key
    , host = opts.host || 'cisaurus.heroku.com'
    , version = opts.version || 'v1'
    , title = appname(env, job)
    , downstreamTitle = appname(downstream, job)
    , baseUrl = 'https://:'+key+'@'+host
    , verUrl = baseUrl+'/'+version
    , promoteUrl = [verUrl,'apps',title,'pipeline','promote'].join('/');

  log('promoting', title, '-->', downstreamTitle);
  superagent
    .post(promoteUrl)
    .set({'User-Agent': 'node-loops'})
    .on('error', done)
    .end(function(res) {
      if (res.error) return done(new Error(res.text));

      var location = res.headers.location;

      function poll(res) {
        log('.');
        if (res.status === 202) return superagent
          .get(baseUrl+location)
          .set({'User-Agent': 'node-loops'})
          .on('error', done)
          .end(poll);

        if (res.error) return done(new Error(res.text));

        log(downstreamTitle, 'release', res.body.release);

        done();
      };

      poll(res);
    });
};

function appname(env, job) {
  return job.title+'-'+env;
};