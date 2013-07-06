/**
 * Module dependencies.
 */

var debug = require('simple-debug')('loops:worker')
  , os = require('os')
  , uid = require('websafe-uid').uid;

module.exports = function(callbacks) {

  var clone = callbacks('clone')
    , createBuild = callbacks('createBuild')
    , initApp = callbacks('initApp')
    , environments = callbacks('environments')
    , preDeploy = callbacks('preDeploy', function(env, hook, log, done) {done()})
    , deploy = callbacks('deploy')
    , postDeploy = callbacks('postDeploy', function(env, hook, log, done) {done()});

  return function(job, end) {
    var hook = job.data
      , log = job.log.bind(job)
      , progress = job.progress.bind(job);

    // createBuild - create a build record in the database
    // clone - clone a local copy of the app
    // initApp - initialize the app if it doesn't exist. at this point set some initial config vars
    // environments - get the environments for the app
    
    // get a temp dir
    hook.dir = os.tmpdir() + uid(10);

    // Get the environments for the app
    log('step: environments');
    environments(hook, log, function(err, envs) {
      if (err) return end(err);

      // setup the length of the progress
      var len = envs.length * 3 + 3;

      // clone the repo down
      log('step: clone');
      clone(hook, log, function(err) {
        if (err) return end(err);
        progress(1, len);

        // initialize the app
        log('step: init');
        initApp(hook, log, function(err) {
          if (err) return end(err);
          progress(2, len);

          var index = 0;

          function doDeploy(err) {
            if (err) return end(err);

            // Get the next environment
            var env = envs[index++];
            if (!env) return end();

            // pre-deploy
            log('step: pre-deploy-'+env);
            preDeploy(env, hook, log, function(err) {
              if (err) return end(err);
              progress(index+2+1, len);

              // deploy
              log('step: deploy-'+env);
              deploy(env, hook, log, function(err) {
                if (err) return end(err);
                progress(index+2+2, len);

                // post-deploy
                log('step: post-deploy-'+env);
                postDeploy(env, hook, log, doDeploy);
              });
            });
          };

          doDeploy();
        });
      });
    });
  };
};
