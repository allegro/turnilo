# Generating Links Into Pivot

If you want to generate links into Pivot from external systems you can do so by posting to `/mkurl` or `<serverRoot>/mkurl`.

The post body must include 3 keys:

**domain** (string)

The domain on which pivot is running

**dataSource** (string)

The dataSource name to be used in the link

**essence** (Essence)

The essence JSON that describes the state

### Example

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
