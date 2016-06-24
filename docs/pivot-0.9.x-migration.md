# Migrating to Pivot 0.9.x

There have been a number of changes in the Pivot 0.9.x release that might be breaking under certain circumstances.


## 'clusters' in the config

Pivot can now connect to multiple clusters.

The cluster information used to live in the root of the config file.

```yaml
# Old style config
druidHost: localhost:8082
timeout: 30000
sourceListScan: auto
sourceListRefreshOnLoad: true

# ...
```

In 0.9.x style configs the cluster information needs to be defined as an element in the `clusters` array

```yaml
# New style config
clusters:
  - name: druid
    type: druid
    host: localhost:8082 # 'druidHost' becomes 'host'
    timeout: 30000
    sourceListScan: auto
    sourceListRefreshOnLoad: true

# ...
```

The `name` of the cluster must match up with the `engine` property in the dataSource (which is probably `'druid'`)

Doing this change is not required as Pivot is fully backwards compatible with the old config style, but you will have
to upgrade to the new style to utilize some of the new features.

Pivot can also perform this update for you.
Run `pivot -c old_config.yaml --print-config > new_config.yaml` and double check by diffing `old_config.yaml` and
`new_config.yaml` to ensure nothing got lost


## No host override

In Pivot 0.8.x it was possible to run `pivot --config your_config.yaml --druid override.broker.host` to override the
druidHost property in the config.

While useful, this is difficult to manage with multiple clusters and has been removed.
In it's place there is a more generic system that allows environment variables to be inlined in the config.

The value of and any `%{X}%` will be replaced with the value of the environment variable `X` at load time.

Thus in `your_config.yaml` you can set:

```yaml
# New style config
clusters:
  - name: druid
    type: druid # can be druid, postgres, or mysql
    host: "%{DRUID_OVERRIDE}%"
    timeout: 30000
    sourceListScan: auto
    sourceListRefreshOnLoad: true

# ...
```

And then run it as: `DRUID_OVERRIDE=override.broker.host pivot --config your_config.yaml` now you can override
arbitrary properties


## Druid Request Decorator API change

If you are using a druidRequestDecorator then you will need to adjust it a little bit:

* the config key was renamed from `druidRequestDecorator` to `requestDecorator`
* the logger is no longer a function but a Logger instance instead of `logger('blah')` use `logger.log('blah')`
* the config is no longer passed in, instead the contents of `decoratorOptions` and the `cluster` objects are passed in
* a `version` (`1`) now needs to be exported form the module
* the exported function now needs to be called `druidRequestDecoratorFactory` instead of `druidRequestDecorator`

See the [example](./security.md) for more information.
