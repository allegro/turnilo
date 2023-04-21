---
title: Configuration - data cubes
nav_order: 3
layout: page
---

## Overview

The top level `dataCubes:` key that holds the data cubes that will be loaded into Turnilo.
The order of the data cubes in the config will define the ordering seen in the UI.


## Basic data cube properties

Described here are only the properties which you might want to change.

**name** (string)

The name of the data cube as used internally in Turnilo and used in the URLs. This should be a URL safe string.
Changing this property for a given data cube will break any URLs that someone might have generated for that data
cube in the past.

**title** (string)

The user visible name that will be used to describe this data cube in the UI. It is always safe to change this.

**description** (markdown)

The description of the data cube in Markdown format. Description is shown on home page. 
If description contains horizontal line (markdown: ` --- `) it will split description and 
later part will be visible after clicking "Show more" button on UI.

**clusterName** (string)

The cluster that the data cube belongs to (or "native" if this is a file based data cube).

**source** (string or string[])

Druid data source name or names. Multiple names result in [Union Data Source](https://druid.apache.org/docs/latest/querying/datasource.html)

**defaultTimezone** (string - timezone)

The default timezone, expressed as an [Olsen Timezone](https://en.wikipedia.org/wiki/Tz_database),
that will be selected when the user first opens this cube. Default `Etc/UTC`.

**defaultDuration** (string - duration), default P1D (1 day)

The time period, expressed as an [ISO 8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations),
that will be shown when the user first opens this cube.

**defaultSortMeasure** (string), default: the first measure

The name of the measure that will be used for default sorting. It is commonly set to the measure that represents the
count of events.

**defaultSelectedMeasures** (string[]), default: first four measures

The names of the measures that will be selected by default.

**defaultPinnedDimensions** (string[])

The names of the dimensions (in order) that will appear *pinned* by default on the right panel.

**introspection** ("none" \| "no-autofill" \| "autofill-dimensions-only" \| "autofill-measures-only" \| "autofill-all")

Data cube introspection strategy.

**subsetFormula** (string - plywood expression)

A filter defined as [Plywood expression](https://plywood.imply.io/expressions) that is applied to data cube. This expression is not shown in the filter area, so Turnilo user is not aware of subset formula filter clause.

**refreshRule**

Refresh rule defining how the information about the latest data in a data source is obtained.

**maxSplits** (number)

Number of splits data cube supports. Defaults to 3.

**maxQueries** (number)

Number of queries that can be issued to druid. Defaults to 500.

## Refresh rules

The `refreshRule:` section of the data cube allows the customisation of the latest data discovery mechanism.

**rule** ("query" \| "realtime" \| "fixed" ), default: "query"

The name of the rule which will be used to obtain information about the latest data. Following rules are available:

- `query`: best suited for batch data sources. The data source will be queried every minute to obtain the maximum value from time dimension.
- `realtime`: best suited for realtime data sources. The data source will not be queried and the value of *now* is assumed as the latest data time.
- `fixed`: best suited for constant data sources. The data source will not be queried and the value of `refreshRule.time` property will be used.

**time** (string - date with time instant)

Latest date time of a data source, expressed as [ISO 8601 Instant](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations).
Applicable only if `refreshRule.rule` is set to `fixed`.

## Attribute Overrides

While Turnilo tries to learn as much as it can from your data cube from Druid directly.
It can not (yet) do a perfect job. The `attributeOverrides:` section of the data cube is there for you to fix that.

**name** (string)

The name of the attribute (column) in Druid. This must match the Druid name.

Here are some common scenarios where you should add an attribute override:

### Override native Druid type

If Turnilo is not able to discover column type, it could be overridden with Druid native column type. 

```yaml
- name: column_name
  nativeType: hyperUnique
```

Supported native types: "hyperUnique", "thetaSketch" and "approximateHistogram".

### Override numeric dimension

Turnilo could not correctly detect numeric dimensions as Druid reports all dimensions to be strings.
When a numeric dimension is incorrectly classified as a string its sorting will appear wrong in the UI.
If you have a dimension with numeric values (say: `age`).

You should add:

```yaml
- name: age
  type: NUMBER
```

To the `attributeOverrides` to tell Turnilo that this is numeric.

You can now use `$age` in numeric expressions. For example, you could create a dimension with the formula
`$age / 2 + 7`.


## Dimensions

In this section you can define the dimensions that users can *split* and *filter* on in the UI.
Dimensions may be organized as list or tree where each item of list can be either a dimension
or [dimension group](#dimension-group) having its own dimensions list or tree.
The order of the dimension list in the top of the left panel is determined by the order of the dimensions definitions
in this section.


### Dimension

Dimensions are defined with following attributes:

**name** (string)

The name of the dimension.
This does not have to correspond to the attribute name (but the auto generated dimensions do).
This should be a URL safe string and unique across dimensions, dimension groups, measures and measure groups.
Changing this property will break any URLs that someone might have generated that include this dimension.

**title** (string)

The title for this dimension in the UI. Can be anything and is safe to change at any time.

**description** (string)

The description of the dimension in the UI. Accepts Markdown format.

**url** (string)

An url associated with the dimension, with optional token '%s' that is replaced by the dimension value to generate
a link specific to each value.

**granularities** (string[5] or number[5]), default: ["PT1M", "PT5M", "PT1H", "P1D", "P1W"]`

For time dimensions you can define a set of exactly 5 granularities that you want to be available for bucketing.

Each granularity must be expressed as a 'floorable' [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations)
A floorable duration is any duration that is either a single period like `P1D`, `P1W`, `PT1S`, e.t.c. or a multiple period
that divides into the larger period. For example, `P3M` is floorable because 3 divides 12 but `P5M` is not floorable.

If you mainly care about smaller intervals, you might want to set it to: `['PT1S', 'PT15S', 'PT30S', 'PT1M', 'PT1H']`

Alternatively, if you mainly care about large intervals, you might want to try: `['P1D', 'P1W', 'P1M', 'P3M', 'P1Y']`

For number dimensions you can just provide 5 bucket sizes as integers.

**bucketingStrategy** ("defaultBucket" \| "defaultNoBucket")

Specify whether the dimension should be bucketed by default. If unspecified defaults to 'defaultBucket' for time and numeric dimensions.

**sortStrategy** ("self" \| `someMeasureName`)

Specify a specific sort strategy for this dimension in visualizations. If unspecified defaults to best sort strategy based on the visualization.

**kind** ("string" \| "boolean" \| "number" \| "time")

Specify kind of data inside dimension. It defaults to "string".

**multiValue** (boolean)

Set to true if dimension holds multiple values. [Druid Multi-Value Dimensions](https://druid.apache.org/docs/latest/querying/multi-value-dimensions.html)

**limits** (number[]), default: [5, 10, 25, 50, 100]

Specify available limit values for dimension. Please note that specific visualisations can override chosen limit, for example line chart limits are driven by available [visualisation colors](configuration-customizations.md#visualisation-colors).

**formula** (string - plywood expression)

The [Plywood expression](https://plywood.imply.io/expressions) for this dimension.
By default, it is `$name` where *name* is the name of the dimension.
You can create derived dimensions by using non-trivial formulas.

Here are some common use cases for derived dimensions:

#### Lookup formula

If you have a dimension that represents an ID that is a key into some other table. You may have set up a
[Druid Query Time Lookup](https://druid.apache.org/docs/latest/querying/lookups.html) in which case you could

```yaml
- name: correctValue
  formula: $lookupKey.lookup('my_awesome_lookup')
```

Which would apply the lookup.

You can also apply the `.fallback()` action as ether:

- `$lookupKey.lookup('my_awesome_lookup').fallback($lookupKey)` to keep values that were not found as they are.
- `$lookupKey.lookup('my_awesome_lookup').fallback('missing')` to map missing values to the word 'missing'.

#### Extraction formula

Imagine you have an attribute `resourceName` which has values:

```json
["druid-0.8.2", "druid-0.8.1", "druid-0.7.0", "index.html"]
```

You could apply, for example, the `.extract` function by creating the following dimension:

```yaml
- name: resourceVersion
  formula: $resourceName.extract('(\d+\.\d+\.\d+)')
```

Which would have values:

```json
["0.8.2", "0.8.1", "0.7.0", null]
```

#### Boolean formula

It is often useful to create dimensions that are the result of some boolean expression.
Let's say that you are responsible for all accounts in the United States as well as some specific account you could create a dimension like:

```yaml
- name: myAccounts
  formula: $country == 'United States' or $accountName.in(['Toyota', 'Honda'])
```

Now my account would represent a custom filter boolean dimension.

#### Quantiles

If you have dimension defined as histogram, you can add quantile measure. Use plywood method quantile on desired histogram and provide required parameters.
Percentile parameter would be used as default percentile and could be adjusted on UI. Tuning parameters will be passed as is to Druid. 

```yaml
- name: clicks_percentile
  formula: $main.quantile($response_time_ms, 0.99, 'k=128')
```

Turnilo can handle percentiles only as top level operation in expression, so it is impossible to nest quantile expression inside let's say division. 

```yaml
- name: opaque_percentile_formula
  formula: $main.quantile($response_time_ms, 0.9, 'k=128') * 1000
```

If turnilo encounters such formula, it would assume it is simple measure. User would be able to use this measure as is, but won't be able to picking percentile. 

#### Custom transformations

If no existing plywood function meets your needs, you could also define your own custom transformation.
The transformation could be any supported [Druid extraction function](https://druid.apache.org/docs/latest/querying/dimensionspecs.html).

For example, you could apply any number of javascript functions to a string.

To use that in Turnilo define following `options` at data cube level:

```yaml
options:
  customTransforms:
    stringFun:
      extractionFn:
        type: javascript
        function: function(x) { try { return decodeURIComponent(x).trim().charCodeAt(0) } catch(e) { return null; } }
```

Then in the dimensions simply reference `stringFun` like so:

```yaml
- name: stringFun
  title: String Fun
  formula: $countryURL.customTransform('stringFun')
```

### Dimension Group

Dimension groups are defined with following attributes:

**name** (string)

The name of the dimension group.
This should be a URL safe string and unique across dimensions, dimension groups, measures and measure groups.

**title** (string)

The title for this dimension group in the UI. Can be anything and is safe to change at any time.

**description** (string)

The description of the dimension group in the UI. Accepts Markdown format.

**dimensions** (Dimension \| DimensionGroup)[]

An array of nested dimensions or dimension groups. It cannot be empty.

## Measures

In this section you can define the measures that users can *aggregate* on (*apply*) on in the UI.
Measures may be organized as list or tree where each item of list can be either a measure
or [measure group](#measure-group) having its own measures list or tree.
The order of the measure list in the bottom of the left panel is determined by the order of the measure definitions
in this section.

### Measure

Measures are defined with following attributes:

**name** (string)

The name of the measure.
This should be a URL safe string.
Changing this property will break any URLs that someone might have generated that include this measure.

**title** (string)

The title for this measure in the UI. Can be anything and is safe to change at any time.

**description** (string)

The description of the measure in the UI. Accepts Markdown format.

**units** (string)

The units for this measure. To be shown alongside the title.

**lowerIsBetter** (boolean) default: false

If set to true measure will be interpreted in UI as "better" when value is lower.

**format** (string)  default: "0,0.0 a"

Default format for measure as string in [numbro format](https://numbrojs.com/old-format.html).

**formula** (string - plywood expression)

The [Plywood expression](https://plywood.imply.io/expressions) for this dimension. 
By default, it is `$main.sum($name)` where *name* is the name of the measure.

The `$main` part of the measure expressions serves as a placeholder for the data segment.
In Plywood every aggregate is a function that acts on a data segment.

**transformation** ("none", "percent-of-parent", "percent-of-total"), default: "none"

Predefined transformation that can be applied to a measure formula. Currently supported options are:
- "none" - no transformation;
- "percent-of-parent" - displays the ratio between expression value at current split and expression value at parent split;
- "percent-of-total" - displays the ratio between expression value at current split and total expression value without splitting.


One can also create derived measures by using non-trivial expressions in **formula**. Here are some common use cases for derived dimensions:


#### Ratio formula

Ratios are generally considered fun.

```yaml
- name: cpm
  title: CPM
  formula: $main.sum($revenue) / $main.sum($impressions) * 1000
```


#### Filtered aggregations formula

A very powerful tool is to use a filtered aggregate.
If, for example, your revenue in the US is a very important measure you could express it as:

```yaml
- name: usa_revenue
  title: USA Revenue
  formula: $main.filter($country == 'United States').sum($revenue)
```

It is also common to express a ratio of something filtered vs unfiltered.

```yaml
- name: errorRate
  formula: $main.filter($statusCode == 500).sum($requests) / $main.sum($requests)
```


#### Custom aggregations

Within the measures you have access to the full power of the [Plywood expressions](https://plywood.imply.io/expressions).
If you ever find yourself needing to go beyond the expressive potential of Plywood you could define your own custom aggregation.
The aggregation could be any supported Druid aggregation.

For example Plywood currently does not support the modulo operator.
While Druid has no native modulo support ether it is possible to modulo a measure by using a [javascript aggregator](https://druid.apache.org/docs/latest/querying/aggregations.html#javascript-aggregator).

To use that in Turnilo define following `options` at data cube level:

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
  formula: $main.customAggregate('addedMod1337')
```

This functionality can be used to access any custom aggregations that might be loaded via extensions.


#### Switching metric columns

If you switch how you ingest you underlying metric and can't (or do not want to) recalculate all the previous data,
you could use a derived measure to seemly merge these two metrics in the UI.

Let's say you had a metric called `revenue_in_dollars` and for some reason you will now be ingesting it as `revenue_in_cents`.

Furthermore, right now your users are using Turnilo with the measure:

```yaml
- name: revenue
  title: Revenue
  formula: $main.sum($revenue_in_dollars)
```

If your data had a 'clean break' where all events have ether `revenue_in_dollars` or `revenue_in_cents` with no overlap you could use:

```yaml
- name: revenue
  title: Revenue
  formula: $main.sum($revenue_in_dollars) + $main.sum($revenue_in_cents) / 100
```

If instead there was a period where you were ingesting both metrics then the above solution would double count that interval.
You can 'splice' these two metrics together at a specific time point.

Logically you should be able to leverage the [Filtered aggregations](#filtered-aggregations-formula) to do:

```yaml
- name: revenue  # DO NOT DO THIS IT WILL NOT WORK WITH DRUID < 0.9.2
  title: Revenue
  formula: >
    $main.filter(__time < '2016-04-04T00:00:00Z').sum($revenue_in_dollars) +
    $main.filter('2016-04-04T00:00:00Z' <= __time).sum($revenue_in_cents) / 100
```

But the above will not work because, as of this writing, [Druid can not filter on time in measures](https://github.com/druid-io/druid/issues/2816).

Instead, you can leverage [Custom aggregations](#custom-aggregations) and the `javascript` aggregation to achieve essentially the same thing:

```yaml
# Add this to the data cube options
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
  formula: $main.customAggregate('revenueSplice')
```

Note that whichever method you chose you should not change the `name` attribute of your original measure as it will preserve the function of any bookmarks.


### Measure Group

Measure groups are defined with following attributes:

**name** (string)

The name of the measure group.
This should be a URL safe string and unique across dimensions, dimension groups, measures and measure groups.

**title** (string)

The title for this measure group in the UI. Can be anything and is safe to change at any time.

**description** (string)

The description of the measure group in the UI. Accepts Markdown format.

**measures** (Measure \| MeasureGroup)[]

An array of nested measures or measure groups. It cannot be empty.


## Advanced data cube options

One can set advanced options for every data cube configured in Turnilo with the following properties
defined in `options` property of a date cube:

**customAggregations**

Custom measure aggregations definition. See [Custom aggregations](#custom-aggregations).

**customTransforms**

Custom dimension transformations definition. See [custom transformations](#custom-transformations).

**druidContext**

Context to be sent to Druid with every query executed on the data cube defined as yaml key / value mappings.
See [Druid context](https://druid.apache.org/docs/latest/querying/query-context.html).

Advanced options example:
```yaml
- name: data_cube
  options:
    customTransforms:
      ...
    customAggregation:
      ...
    druidContext:
      priority: 100
      useCache: false
```
