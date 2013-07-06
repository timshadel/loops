/**
 * Module dependencies
 */

var loops = require('..')
  , github = require('./plugins/github')
  , heroku = require('./plugins/heroku')
  , kue = require('./plugins/kue');

/**
 * Expose the app
 */

var app = module.exports = loops();

app.plugin(github({

}));

app.plugin(heroku({
  key: process.env.HEROKU_KEY
}));

app.plugin(kue({

}));

app.environments(function(job, log, done) {
  done(null, ['build', 'test', 'prod']);
});
