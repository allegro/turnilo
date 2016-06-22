exports.version = 1;

// logger - is just a collection of functions that you should use instead of console to have your logs included with the Pivot logs
// params - is an object with the following keys:
//   * options: the decoratorOptions part of the cluster object
//   * cluster: Cluster - the cluster object
exports.druidRequestDecoratorFactory = function (logger, params) {
  var options = params.options;
  var myUsername = options.myUsername; // pretend we store the username and password
  var myPassword = options.myPassword; // in the config

  if (!myUsername) throw new Error('must have username');
  if (!myPassword) throw new Error('must have password');

  logger.log("Decorator init for username: " + myUsername);

  var auth = "Basic " + Buffer(myUsername + ":" + myPassword).toString('base64');

  // decoratorRequest: DecoratorRequest - is an object that has the following keys:
  //   * method: string - the method that is used (POST or GET)
  //   * url: string -
  //   * query: Druid.Query -
  return function (decoratorRequest) {

    var decoration = {
      headers: {
        "Authorization": auth,
        "X-I-Like": "Koalas"
      }
    };

    // This can also be async if instead of a value of a promise is returned.
    return decoration;
  };
};
