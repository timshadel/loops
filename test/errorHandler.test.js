/**
 * Module dependencies.
 */
var expect = require('expect.js')
  , errorHandler = require('../lib/errorHandler');

/**
 * Expect the app to have a default error handler.
 */
describe('the error handler', function () {
  var res = { status: function(status){ this._status = status;}, send: function(){} }

  it('should return 500 if given no instructions', function () {
    var handler = errorHandler();
    handler({}, {}, res, {});
    expect(res._status).to.be(500);
  });

  it('should return 404 when instructed', function () {
    var handler = errorHandler();
    var err = { code: 404 };
    handler(err, {}, res, {});
    expect(res._status).to.be(404);
  });
});