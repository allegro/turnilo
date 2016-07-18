# Security in Pivot

## User management

Pivot does not currently have a concept of a user. Everyone who has access to a given Pivot server has equal access to that server.
Pivot can act as a 'gatekeeper' for Druid or any supported datasource via the config.

### Data source level access

It is possible to restrict which data cubes users have access to by explicitly defining in the config all the data cubes that you want the users to see and disabling source discovery.
This will prevent any data cube not explicitly defined from being queried through Pivot.

### Column level access

It is possible restrict which columns users have access to by explicitly defining all the dimensions and measures that you want the users to see and disabling introspection.
Any query asking for a column that was not explicitly defined in the dimensions or measures will fail.

### Row level access

A Pivot dataSource can define a `subsetFilter` that is a boolean Plywood filter clause that will be silently applied to all queries made to that data cube.
For example if you wanted your users to only see the data for "United States" you could add `subsetFilter: $country == "United States"` to the data cube definition.


## Authentication

Pivot can authenticate to a Druid server via request decoration. You can utilize it as follows:

In the config add a key of `druidRequestDecorator` that point to a relative js file.

`druidRequestDecorator: './druid-request-decorator.js'`

Then the contract is that your module should export a function `druidRequestDecorator` that has to return a decorator.
 
A decorator is a function that gets called on every request and receives a Druid query and may return an object with the
key `headers` where you can set whatever headers you want.

Here is an example decorator:

```javascript
exports.version = 1;

// logger - is just a collection of functions that you should use instead of console to have your logs included with the Pivot logs
// options - is an object with the following keys:
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
```

You can find this example, with an example config, in the [./example](./example/request-decoration) folder.

This would result in all Druid requests being tagged as:

![decoration example](./example/request-decoration/result.png)
