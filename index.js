module.exports = process.env.LOOPS_COV
  ? require('./lib-cov')
  : require('./lib');
