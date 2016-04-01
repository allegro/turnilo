# Security in Pivot

Pivot does not currently have a concept of a user. Everyone who has access to a given Pivot server has equal access to that server.
Pivot can act as a 'gatekeeper' for Druid or any supported datasource via the config.

### Data source level access

It is possible to restrict which data sources users have access to by explicitly defining in the config all the data sources that you want the users to see and disabling source discovery.
This will prevent any data sources not explicitly defined from being queried through Pivot.

### Column level access

It is possible restrict which columns users have access to by explicitly defining all the dimensions and measures that you want the users to see and disabling introspection.
Any query asking for a column that was not explicitly defined in the dimensions or measures will fail.

### Row level access

A Pivot dataSource can define a `subsetFilter` that is a boolean Plywood filter clause that will be silently applied to all queries made to that data source.
For example if you wanted your users to only see the data for "United States" you could add `subsetFilter: $country == "United States"` to the data source definition.
