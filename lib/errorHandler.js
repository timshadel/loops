/**
 * Module dependencies.
 */

module.exports = function() {
	return function errorHandler(err, req, res, next) {
	  var code = err.code || 500
	    , title = err.title || "Server Error"
	    , message = (process.env.NODE_ENV === "production") ? err.message : err.stack;
	  
	  res.status(code);
	  res.send("<pre>"+message+"</pre>");
	}
}
