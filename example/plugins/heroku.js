/**
 * Module dependencies
 */

var spawn = require('child_process').spawn
  , exec = require('child_process').exec;

module.exports = function(opts) {

  return function(app) {
    var environments = app.callback('environments');

    function push(env, job, log, done) {
      switchRemotes(env, job, function(err) {
        if (err) return done(err);

        forceUpdate(job, function(err, sha) {
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

    function promote(env, job, log, done) {
      switchRemotes(env, job, function(err) {
        if (err) return done(err);
        var gpush = spawn('heroku', ['pipeline:promote'], {cwd: job.dir});

        gpush.stdout.setEncoding('utf8');
        gpush.stderr.setEncoding('utf8');

        gpush.stdout.on('data', log);
        gpush.stderr.on('data', log);

        gpush.on('close', function(code) {
          if (code !== 0) return done(new Error('`heroku pipeline:promote` exited with status '+code));
          done();
        });
      });
    };

    app.initApp(function(job, log, done) {
      environments(job, log, function(err, envs) {
        if (err) return done(err);

        // TODO initialize repos if they don't exist
        done();      
      });
    });

    app.deploy(function(env, job, log, done) {
      environments(job, log, function(err, envs) {
        if (err) return done(err);

        var index = envs.indexOf(env);

        if (index === 0) push(env, job, log, done);
        // Send the env before
        else promote(envs[index-1], job, log, done);
      });
    });
  };
};

function switchRemotes (env, job, done) {
  exec('git remote rm heroku', {cwd: job.dir}, function(err, stdout, stderr) {
    // Ignore the error
    var remote = 'git@heroku.com:'+job.title+'-'+env+'.git';

    exec('git remote add heroku '+remote, {cwd: job.dir}, function(err, stdout, stderr) {
      if (err) return done(err);
      done();
    });
  });
};

function forceUpdate(job, done) {
  exec('git commit --amend --no-edit', {cwd: job.dir}, function(err, stdout, stderr) {
    if (err) return done(err);
    exec('git rev-parse HEAD', {cwd: job.dir}, function(err, stdout, stderr) {
      if (err) return done(err);
      done(null, stdout);
    });
  });
};
