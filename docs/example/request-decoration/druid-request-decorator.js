// logger - is just a function that you cna use instead of console.log to have your logs included with the Pivot logs
// options - is an object with the following keys:
//   * config: Object - the JSON config that was parsed
exports.druidRequestDecorator = function (logger, options) {
  var config = options.config;
  var myUsername = config.myUsername; // pretend we store the username and password
  var myPassword = config.myPassword; // in the config

  if (!myUsername) throw new Error('must have username');
  if (!myPassword) throw new Error('must have password');

  logger("Decorator init for username: " + myUsername);

  var auth = "Basic " + Buffer(myUsername + ":" + myPassword).toString('base64');

  // decoratorRequest: DecoratorRequest - is an object that has the following keys:
  //   * method: string - the method that is used (POST or GET)
  //   * url: string -
  //   * query: Druid.Query -
  return (decoratorRequest) => {
    
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
