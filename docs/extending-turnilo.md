# Extending Turnilo

* TOC
{:toc}

## Overview

Turnilo lets you extend its behaviour in three ways:

* Request decorator for all Druid queries sent to Druid cluster
* Query decorator for all Plywood queries sent to Druid cluster
* Plugins for backend application

## Request decorator

In the cluster config add a key `druidRequestDecorator` with property `path` that points to a relative js file.

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

The contract is that your module should export a function `druidRequestDecoratorFactory` that has to return a decorator.
 
A decorator is a function that gets called on every request. It receives a Druid query and may return an object with the
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

## Query decorator

In the data cube config add `queryDecorator` field with key `path` pointing to javascript file. 
This file should export function named `decorator`. 
This function will be called before every Plywood query is sent to Druid from Turnilo.
Function is called with four arguments:
* Plywood query
* Request object
* Decorator options
* Plywood library instance

Decorator function should return valid Plywood expression.

```javascript
exports.decorator = function (expression, request, options, plywood) {
  const userId = request.headers["x-user-id"]; // get userId from header, you need to set this value before Turnilo
  const userColumnName = options.userColumnName; // get value from options, defined in config
  const filterClause = plywood.$(userColumnName).in([userId]); // show only rows where `userColumnName` is equal to current user id.
  return expression.substitute(e => {
    if (e instanceof plywood.RefExpression && e.name === "main") { // filter all main expression references
      return e.filter(filterClause);
    }
    return null;
  });
}
```

And needed configuration:

```yaml
...
dataCubes:
    - name: cube
      queryDecorator:
        path: ./decorator.js
        options:
          userColumnName: "user_id"
```

## Plugins

Most powerful way to extend turnilo are plugins. They are defined at top level in config and apply for whole Turnilo application.
You need to add your plugin as entry under `plugins` field. 
Plugin need to have two fields:
    - `name` - name for debug purposes
    - `path` - path to the js file
It can define additional field `settings`. Content of this field would be passed to plugin so it is good place for additional parameters.

```yaml
plugins:
    - name: example_plugin
      path: ./plugin.js
      settings:
        favourite_number: 42
```

Plugin file need to export function named `plugin`. 
This function will be called at the start of application with following parameters:
* `app` - Express instance of Turnilo application. Remember that Turnilo routes are called after your plugins so be careful.
* `pluginSettings` - object from `settings` field in configuration
* `serverSettings` - object representing server settings, like port, host, ready- and live- endpoints.
* `appSettings` - function that returns promise with application settings - definitions of clusters, data sources and customization.
* `logger` - logger object that you can use to log anything

Worth to look into !(express documentation)[https://expressjs.com/en/api.html#app]. 
Use `get`, `post` etc. to define new endpoints. Use `use` to define middleware.

Additionally, Turnilo defines empty object on Request object under `turniloMetadata` key. 
Here you can pass values between your plugins and not pollute headers.
