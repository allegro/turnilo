

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

Turnilo dataSource can also define `queryDecorator` - function that can decorate Plywood query. In this case it could additional filter clause that will be silently applied to all queries made to that cube.
This function is called at every query and have access to Request object. Read more about ![query decorator](./extending-turnilo.md).

## Authentication

Turnilo can authenticate to a Druid server via ![request decoration](./extending-turnilo.md). 
