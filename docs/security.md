

**This document has not been updated yet, enter at your own risk.**


# Security in Turnilo

## User management

Turnilo does not currently have a concept of a user. Everyone who has access to a given Turnilo server has equal access to that server.
Turnilo can act as a 'gatekeeper' for Druid or any supported datasource via the config.

### Data cubes level access

It is possible to restrict which data cubes users have access to by explicitly defining in the config all the data cubes that you want the users to see and disabling source discovery.
This will prevent any data cube not explicitly defined from being queried through Turnilo.

Alternatively you can set up auth proxy (eg. nginx) which will be adding header `x-turnilo-allow-datacubes`.
It have to contains names of datacubes which have to be accessible for user, delimited by comma. Wildcard(\*) means all datacubes.
Examples of `x-turnilo-allow-datacubes`:
- `"*"`
- `"some-name"`
- `"name1,name2"`
- `"name1,name2,*"`

Additionally, enable guard by adding in config in cluster section:
```yaml
clusters:
  - name: druid
[...]	
    guardDataCubes: true
[...]
```

### Column level access

It is possible restrict which columns users have access to by explicitly defining all the dimensions and measures that you want the users to see and disabling introspection.
Any query asking for a column that was not explicitly defined in the dimensions or measures will fail.

### Row level access

A Turnilo dataSource can define a `subsetFormula` that is a boolean Plywood filter clause that will be silently applied to all queries made to that data cube.
For example if you wanted your users to only see the data for "United States" you could add `subsetFormula: $country == "United States"` to the data cube definition.


## Authentication

Turnilo can authenticate to a Druid server via request decoration. You can utilize it as follows:

In the config add a key of `druidRequestDecorator` with property `path` that point to a relative js file.

```yaml
druidRequestDecorator: 
    path: './druid-request-decorator.js'
```

You can also pass parameters to your decorator using `options` field. Content of this field will be read as json and passed
to your `druidRequestDecoratorFactory` under `options` key in second parameter.

```yaml
druidRequestDecorator: 
    path: './druid-request-decorator.js'
    options:
        keyA: valueA
        keyB:
          - firstElement
          - secondElement
```

Then the contract is that your module should export a function `druidRequestDecorator` that has to return a decorator.
 
A decorator is a function that gets called on every request and receives a Druid query and may return an object with the
key `headers` where you can set whatever headers you want.

Here is an example decorator:

```javascript
exports.version = 1;

exports.druidRequestDecoratorFactory = function (logger, params) {
  const options = params.options;
  const username = options.username;
  const password = options.password;

  const auth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  return function () {
    return {
      headers: {
        "Authorization": auth
      },
    };
  };
};
```

You can find this example with additional comments and example config in the [./example](./example/request-decoration) folder.

This would result in all Druid requests being tagged as:

![decoration example](./example/request-decoration/result.png)
