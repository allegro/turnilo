# Configuring Pivot

It is easy to start using Pivot with Druid by pointing it at your Druid cluster: `pivot --druid druid.broker.host:8082`
but to make the most of Pivot you will want to configure it.

Pivot can be configured with a *config* YAML file. While you could write one from scratch it is recommended to let
Pivot give you a head start by using it to generate a config file for you using the default introspection.

Run:

```bash
pivot --druid druid.broker.host:8082 --print-config --with-comments > config.yaml
```

This will cause Pivot to go through its normal startup and introspection routine and then dump the internally generated
config (complete with comments) into the provided file.

You can now run `pivot --config config.yaml` to run Pivot with your config.

The next step is to open the generated config file in your favourite text editor and configure Pivot to your liking.
Below we will go through a typical configuration flow. At any point you can save the config and re-launch Pivot to load
that config in.


## Configuring the DataSources

In your Pivot config you will see a top level `dataSources:` key that holds the data sources that will be loaded into
Pivot. The order of the data sources in the config will define the ordering seen in the UI.


### Basic data source properties

Described here are only the properties which you might want to change.

**name** (string)

The name of the data source as used internally in Pivot and used in the URLs. This should be a URL safe string.
Changing this property for a given data source will break any URLs that someone might have generated for that data
source in the past.

**title** (string)

The user visible name that will be used to describe this data source in the UI. It is always safe to change this.

**defaultDuration** (duration string)

The time period, expressed as an [ISO 8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations),
that will be shown when the user first opens Pivot. Default `P1D` (1 day).

**defaultSortMeasure** (string)

The name of the measure that will be used for default sorting. It is commonly set to the measure that represents the
count of events. Default: the first measure.

**defaultPinnedDimensions** (string[])

The names of the dimensions (in order) that will appear *pinned* by default on the right panel. Default: `[]`.


### Attribute Overrides

While Pivot tries to learn as much as it can from your data source from Druid directly.
It can not (yet) do a perfect job. The `attributeOverrides:` section of the data source is there for you to fix that.

**name** (string)

The name of the attribute (column) in Druid. This must match the Druid name.

Here are some common scenarios where you should add an attribute override:

#### You have a HyperLogLog metric column but Pivot is not detecting it

If you have a HyperLogLog metric (say: `unique_things`) it is possible that Druid introspection (Druid <= 0.8.3) will
not describe it correctly.
In that case it will be assumed to be a regular numeric column and will ether return incorrect results (or error out)
when included in queries.

You should add:

```yaml
         - name: unique_things
           special: unique
```

To the `attributeOverrides` to tell Pivot that this is indeed a special (hyperUnique) column.

You should also ensure that wherever it is used in the measures it is aggregated with `countDistinct($unique_things)`.

#### You have a numeric dimension

Pivot can not corretly detect numeric dimensions as Druid reports all dimensions to be strings.
When a numeric dimension is incorrectly classified as a string its soring will appear wrong in the UI.
If you have a dimension with numeric values (say: `age`).

You should add:

```yaml
         - name: age
           type: NUMBER
```

To the `attributeOverrides` to tell Pivot that this is numeric.

You can now use `$age` in numeric expressions. For example you could create a dimension with the expression
`$age / 2 + 7`.


### Dimensions

In this section you can define the dimensions that users can *split* and *filter* on in the UI.
The order of the dimension list in the top of the left panel is determined by the order of the dimensions definitions
in this section.

**name** (string)

The name of the dimension.
This does not have to correspond to the attribute name (but the auto generated dimensions do).
This should be a URL safe string.
Changing this property will break any URLs that someone might have generated that include this dimension.

**title** (string)

The title for this dimension in the UI. Can be anything and is safe to change at any time.

**url** (string)

A url associated with the dimension, with optional token '%s' that is replaced by the dimension value to generate 
a link specific to each value.

**expression** (plywood expression)

The expression for this dimension. By default it is `$name` where *name* is the name of the dimension.

You can create derived dimensions by using non-trivial expressions. Here are some common use cases for derived dimensions:


#### Lookups

If you have a dimension that represents an ID that is a key into some other table. You may have set up a
[Druid Query Time Lookup](http://druid.io/docs/latest/querying/lookups.html) in which case you could

```yaml
      - name: correctValue
        expression: $lookupKey.lookup('my_awesome_lookup')
```

Which would apply the lookup.

You can also apply the `.fallback()` action as ether:

- `$lookupKey.lookup('my_awesome_lookup').fallback($lookupKey)` to keep values that were not found as they are.
- `$lookupKey.lookup('my_awesome_lookup').fallback('missing')` to map missing values to the word 'missing'.

#### Extraction

Imagine you have an attribute `resourceName` which has values:

```json
["druid-0.8.2", "druid-0.8.1", "druid-0.7.0", "index.html"]
```

You could apply, for example, the `.extract` function by creating the following dimension:

```yaml
      - name: resourceVersion
        expression: $resourceName.extract('(\d+\.\d+\.\d+)')
```

Which would have values:

```json
["0.8.2", "0.8.1", "0.7.0", null]
```


### Measures

In this section you can define the measures that users can *aggregate* on (*apply*) on in the UI.
The order of the measure list in the bottom of the left panel is determined by the order of the measure definitions
in this section.

**name** (string)

The name of the measure.
This should be a URL safe string.
Changing this property will break any URLs that someone might have generated that include this measure.

**title** (string)

The title for this measure in the UI. Can be anything and is safe to change at any time.

**expression** (plywood expression)

The [Plywood expression](http://plywood.imply.io/expressions) for this dimension. By default it is `$main.sum($name)` where *name* is the name of the measure.

The `$main` part of the measure expressions serves as a placeholder for the data segment.
In Plywood every aggregate is a function that acts on a data segment.

You can create derived measures by using non-trivial expressions. Here are some common use cases for derived dimensions:


#### Dividing to compute ratios

Ratios are generally considered fun.

```yaml
      - name: ecpm
        title: eCPM
        expression: $main.sum($revenue) / $main.sum($impressions) * 1000
```


#### Filtered aggregations

A very powerful tool is to use a filtered aggregate.
If, for example, your revenue in the US is a very important measure you could express it as:

```yaml
      - name: usa_revenue
        title: USA Revenue
        expression: $main.filter($country == 'United States').sum($revenue)
```

It is also common to express a ratio of something filtered vs unfiltered.

```yaml
      - name: errorRate
        expression: $main.filter($statusCode == 500).sum($requests) / $main.sum($requests)
```


#### Custom aggregations

Within the measures you have access to the full power of the [Plywood expressions](http://plywood.imply.io/expressions).
If you ever find yourself needing to go beyond the expressive potential of Plywood you could define your own custom aggregation.
The aggregation could be any supported Druid aggregation.

For example Plywood currently does not support the modulo operator.
While Druid has no native modulo support ether it is possible to modulo a measure by using a [javascript aggregator](http://druid.io/docs/latest/querying/aggregations.html#javascript-aggregator).

To use that in Pivot define:

```yaml
    options:
      customAggregations:
        addedMod1337:
          aggregation:
            type: javascript
            fieldNames: ['added']
            fnAggregate: "function(current, added) { return (current + added) % 1337 }"
            fnCombine: "function(partialA, partialB) { return (partialA + partialB) % 1337 }"
            fnReset: "function() { return 0; }"
```

Then in the measures simply reference `addedMod1337` like so:

```yaml
      - name: addedMod
        title: Added Mod 1337
        expression: $main.custom('addedMod1337')
```

This functionality can be used to access any custom aggregations that might be loaded via extensions.


#### Switching metric columns

If you switch how you ingest you underlying metric and can't (or do not want to) recalculate all of the previous data,
you could use a derived measure to seemly merge these two metrics in the UI.

Let's say you had a metric called `revenue_in_dollars` and for some reason you will now be ingesting it as `revenue_in_cents`.

Furthermore right now your users are using pivot with the measure:

```yaml
      - name: revenue
        title: Revenue
        expression: $main.sum($revenue_in_dollars)
```

If your data had a 'clean break' where all events have ether `revenue_in_dollars` or `revenue_in_cents` with no overlap you could use:

```yaml
      - name: revenue
        title: Revenue
        expression: $main.sum($revenue_in_dollars) + $main.sum($revenue_in_cents) / 100
```

If instead there was a period where you were ingesting both metrics then the above solution would double count that interval.
You can 'splice' these two metrics together at a specific time point.

Logically you should be able leverage the [Filtered aggregations](#filtered-aggregations) to do:

```yaml
      - name: revenue  # DO NOT DO THIS IT WILL NOT WORK WITH DRUID < 0.9.2
        title: Revenue
        expression: >
          $main.filter(__time < '2016-04-04T00:00:00Z').sum($revenue_in_dollars) +
          $main.filter('2016-04-04T00:00:00Z' <= __time).sum($revenue_in_cents) / 100
```

But the above will not work because, as of this writing, [Druid can not filter on time in measures](https://github.com/druid-io/druid/issues/2816).

Instead you can leverage [Custom aggregations](#custom-aggregations) and the `javascript` aggregation to achieve essentially the same thing:

```yaml
    # Add this to the data source options
    options:
      customAggregations:
        revenueSplice:
          aggregation:
            type: javascript
            fieldNames: ['__time', 'revenue_in_dollars', 'revenue_in_cents']
            fnAggregate: "function(current, time, revD, revC) { return current + (time < 1442080800000 ? revD : (revC / 100)); }"
            fnCombine: "function(partialA, partialB) { return partialA + partialB; }"
            fnReset: "function() { return 0; }"
```

Then in the measure definitions:

```yaml
      - name: revenue
        title: Revenue
        expression: $main.custom('revenueSplice')
```

Note that whichever method you chose you should not change the `name` attribute of your original measure as it will preserve the function of any bookmarks.

