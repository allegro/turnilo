# Generating Links Into Pivot

If you want to generate links into Pivot from external systems you can do so by posting to `/mkurl` or `<serverRoot>/mkurl`.

The post body must include 3 keys:

**domain** (string)

The domain on which pivot is running

**dataSource** (string)

The dataSource name to be used in the link

**essence** (Essence)

The essence JSON that describes the state

### Example 1

Here is an example that will show the `totals` visualization filtered on the year 2015 with `count` and `added` metrics selected,
the `page` dimension pinned.

```json
{
  "domain": "http://my.pivot.host",
  "dataSource": "wiki",
  "essence": {
    "visualization": "totals",
    "timezone": "Etc/UTC",
    "filter": {
      "op": "chain",
      "expression": {
        "op": "ref",
        "name": "time"
      },
      "action": {
        "action": "in",
        "expression": {
          "op": "literal",
          "value": {
            "start": "2015-01-01T00:00:00.000Z",
            "end": "2016-01-01T00:00:00.000Z"
          },
          "type": "TIME_RANGE"
        }
      }
    },
    "pinnedDimensions": [
      "page"
    ],
    "singleMeasure": "count",
    "selectedMeasures": [
      "count",
      "added"
    ],
    "splits": []
  }
}
```

Posting this will reply with:

```json
{
  "url": "http://my.pivot.host#wiki/totals/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwA..."
}
```


### Example 2

Here is an example that will show the `line-chart` visualization filtered on the last day of data, 
split on `time` (bucketed by hour), with `count`, `added`, `deleted`, and `delta` measures selected.

```json
{
  "domain": "http://my.pivot.host",
  "dataSource": "wiki",
  "essence": {
    "visualization": "line-chart",
    "timezone": "Etc/UTC",
    "filter": {
      "op": "chain",
      "expression": {
        "op": "ref",
        "name": "__time"
      },
      "action": {
        "action": "in",
        "expression": {
          "op": "chain",
          "expression": {
            "op": "ref",
            "name": "m"
          },
          "action": {
            "action": "timeRange",
            "duration": "P1D",
            "step": -1
          }
        }
      }
    },
    "splits": [
      {
        "expression": {
          "op": "ref",
          "name": "__time"
        },
        "bucketAction": {
          "action": "timeBucket",
          "duration": "PT1H"
        },
        "sortAction": {
          "action": "sort",
          "expression": {
            "op": "ref",
            "name": "__time"
          },
          "direction": "ascending"
        }
      }
    ],
    "singleMeasure": "count",
    "selectedMeasures": [
      "count",
      "added",
      "deleted",
      "delta"
    ],
    "pinnedDimensions": [],
    "multiMeasureMode": true
  }
}
```

Posting this will reply with:

```json
{
  "url": "http://my.pivot.host#wiki/line-chart/2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gQAWAhgJYB2KwA..."
}
```

#### Tip

If you don't want to write out the full json of the filter you can write a [Plywood](https://github.com/implydata/plywood) expression and call `.toJS()` in the filter entry like so.

```json
{
  "domain": "http://my.pivot.host",
  "dataSource": "wiki",
  "essence": {
    "visualization": "line-chart",
    "timezone": "Etc/UTC",
    "filter": "$('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS()",
    "splits": [],
    "singleMeasure": "count",
    "selectedMeasures": [
      "count",
      "added",
      "deleted",
      "delta"
    ],
    "pinnedDimensions": [],
    "multiMeasureMode": true
  }
}
```
