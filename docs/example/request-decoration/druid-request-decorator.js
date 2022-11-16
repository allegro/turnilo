exports.version = 1;

// logger - is just a collection of functions that you should use instead of console
// params - is an object with the following keys:
//   * options: the options field from the requestDecorator property
//   * cluster: Cluster - the cluster object
exports.druidRequestDecoratorFactory = function (logger, params) {

  const options = params.options;
  const extras = options.extras.join(", ");

  const like = `${options.base} with ${extras}`;

  logger.log("Decorator created with options:", { options });

  // decoratorRequest: DecoratorRequest - is an object that has the following keys:
  //   * method: string - the method that is used (POST or GET)
  //   * url: string -
  //   * query: Druid.Query -
  return function (decoratorRequest) {
    const decoration = {
      headers: {
        "X-I-Like": like,
      },
    };

    // This can also be async if instead of a value of a promise is returned.
    return decoration;
  };
};
