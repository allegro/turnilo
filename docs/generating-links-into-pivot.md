# Generating Links Into Pivot

If you want to generate links into Pivot from external systems you can do so by posting to `/mkurl` or `<serverRoot>/mkurl`.

The post body must include 3 keys:

**domain** (string)

The domain on which pivot is running

**dataSource** (string)

The dataSource name to be used in the link

**essence** (Essence)

The essence JSON that describes the state

## Examples

Here are a few examples that you can try out by yourself.
All the examples run on the built in example dataset that comes with pivot.

To follow along please start pivot in `--examples` mode like so:
 
```bash
pivot --examples
```

Each example can be 'run' using curl like so:

```bash
curl -X POST --header "Content-Type:application/json" --data '
{
  "domain": "http://localhost:9090",
  "dataSource": "wiki",
  "essence": {
    ...
  }
}
' localhost:9090/mkurl
```

### Example 1

Here is an example that will show the `totals` visualization filtered on `2015-09-10Z` - `2015-09-20Z` with `count` and `added` metrics selected,
the `page` dimension pinned.

```json
{
  "domain": "http://localhost:9090",
  "dataSource": "wiki",
  "essence": {
    "visualization": "line-chart",
    "timezone": "Etc/UTC",
    "filter": "$time.in(\"2015-09-10Z\", \"2015-09-20Z\")",
    "splits": [{
      "expression": {
        "op": "ref",
        "name": "time"
      },
      "bucketAction": {
        "action": "timeBucket",
        "duration": "PT1H"
      }
    }],
    "singleMeasure": "count",
    "selectedMeasures": ["count", "added", "deleted", "delta"],
    "pinnedDimensions": [],
    "multiMeasureMode": true
  }
}
```

Posting this will produce:

```json
{
  "url": "http://localhost:9090#wiki/line-chart/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsEwGZVyxALbVeYUmOABfZMGIRJHPOkXLOwClTqMWbFV0w58AG1JhqDYqaoA3GwFdxR5mGIMwvAEwAGAIwArAC0vgCcwf6+cL6+uLHxvgB0sb4AWjrkACY+ASHhwX4xcQmxKbEZcsBgAJ5YLsBwAJIAsiAA+gBKAIIAcgDiILIycgDa6LpMrOyc3CZ81ILywtL4ktJVAEaOEADW1GDdSjOqCseG1VLUAEI7+17yWY7WGrwACnD+ABKy8swYniOryM6hO+H+nh09CmBlmxl4AiEoga63EVSypCY500xGYEGo2QoAHNhgBdZBgBjOeQQDCOcgPUYEOkMqjELJZag5R7UUwHLlUTmmdzAcmjcnkRymUxAA="
}
```


### Example 2

Here is an example that will show the `line-chart` visualization filtered on the last 3 days of data (`P3D`), 
split on `time` (bucketed by hour - `PT1H`), with `count`, `added`, `deleted`, and `delta` measures selected.

```json
{
  "domain": "http://localhost:9090",
  "dataSource": "wiki",
  "essence": {
    "visualization": "line-chart",
    "timezone": "Etc/UTC",
    "filter": "$time.in($m.timeRange(P3D, -1))",
    "splits": [
      {
        "expression": {
          "op": "ref",
          "name": "time"
        },
        "bucketAction": {
          "action": "timeBucket",
          "duration": "PT1H"
        }
      }
    ],
    "singleMeasure": "count",
    "selectedMeasures": ["count", "added", "deleted", "delta"],
    "pinnedDimensions": [],
    "multiMeasureMode": true
  }
}
```

Posting this will produce:

```json
{
  "url": "http://localhost:9090#wiki/line-chart/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs6RpbutnsE..."
}
```

*Note*: the `$m` variable represents maxTime - the timestamp of the latest data point. In contrast `$n` represents 'now' 

### Example 3

Here is an example that will auto determine the visualization using the same rules as when a dimension is selected in the UI.
It will also be filtered on two specific channels, split on `page` (bucketed by hour - `PT1H`).

```json
{
  "domain": "http://localhost:9090",
  "dataSource": "wiki",
  "essence": {
    "timezone": "Etc/UTC",
    "filter": "$time.in($m.timeRange(P1D, -1)).and($channel.in([\"en\", \"fr\"]))",
    "splits": ["page"],
    "singleMeasure": "count",
    "selectedMeasures": ["count", "added", "deleted", "delta"],
    "pinnedDimensions": [],
    "multiMeasureMode": true
  }
}
```

Posting this will produce:

```json
{
  "url": "http://localhost:9090#wiki/table/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwApgB5YBO1Azs..."
}
```
