exports.version = 1;

exports.druidRequestDecoratorFactory = function (logger, params) {
  return function (decoratorRequest, context) {
    if (context && context.requestDeadline) {
      const now = new Date().valueOf()
      if (now > context.requestDeadline) {
        throw new Error('request deadline overstepped')
      }
    }
  };
}
