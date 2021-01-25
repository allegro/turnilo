exports.version = 1;

// logger - is just a collection of functions that you should use instead of console
// params - is an object with the following keys:
//   * options: the options field from the requestDecorator property
//   * cluster: Cluster - the cluster object
exports.druidRequestDecoratorFactory = function (logger, params) {
  const options = params.options;
  const username = options.username; // pretend we store the username and password
  const password = options.password; // in the config

  if (!username) {
    throw new Error("must have username");
  }
  if (!password) {
    throw new Error("must have password");
  }

  logger.log("Decorator init for username: " + username);

  const auth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  // decoratorRequest: DecoratorRequest - is an object that has the following keys:
  //   * method: string - the method that is used (POST or GET)
  //   * url: string -
  //   * query: Druid.Query -
  return function (decoratorRequest) {
    const decoration = {
      headers: {
        "Authorization": auth,
        "X-I-Like": "Koalas",
      },
    };

    // This can also be async if instead of a value of a promise is returned.
    return decoration;
  };
};
