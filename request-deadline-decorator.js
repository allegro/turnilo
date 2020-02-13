exports.version = 1;

exports.druidRequestDecoratorFactory = function (logger, params) {
  return function (decoratorRequest, context) {
    var query = Object.assign({}, decoratorRequest.query)

    if (context && context.requestDeadline) {
      var now = new Date().valueOf()
      if (now > context.requestDeadline) {
        throw new Error('request deadline overstepped')
      }
    }

    return {
      query: query,
    }
  };
}
