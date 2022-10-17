---
title: Generating links
nav_order: 5
layout: page
---

## Overview

If you want to generate links pointing to Turnilo's view from external systems you can do so by posting
view definition to `/mkurl` or `<serverRoot>/mkurl` endpoint and appending returned `hash` property
to the base URI of Turnilo instance.

The view definition can be acquired by clicking "Display view definition" in the settings menu in the top-right corner.

The post body must include 3 keys:

**dataCubeName** (string)

The dataCube name to be used in the link.

**viewDefinitionVersion** (ViewDefinitionVersion)

The version of the view definition passed for url generation. Currently supported versions: "2", "3", "4".

**viewDefinition** (ViewDefinition3 \| Essence)

The JSON view definition that describes the state of the Turnilo view. Currently, the latest and greatest view definition
structure is "ViewDefinition4". Be aware that older versions are kept for backwards compatibility only and will be
removed at some point.

## Examples

Here are a few examples that you can try out by yourself.
All the examples run on the built-in example dataset that comes with Turnilo.

To follow along please start Turnilo in `--examples` mode like so:
 
```bash
turnilo --examples
```

Each example can be 'run' using curl like so:

```bash
curl -X POST --header "Content-Type:application/json" --data '
{
  "dataCubeName": "wiki",
  "viewDefinitionVersion": "3",
  "viewDefinition": {
    ...
  }
}
' localhost:9090/mkurl
```

Returned `hash` property value needs to be appended to `http://localhost:9090/` base URI in this example instance
to produce a complete URI.

### Example 1

Here is an example that will show the `totals` visualization filtered on `2015-09-10Z` - `2015-09-20Z` with `count` and `added` metrics selected,
the `page` dimension pinned.

```json
{
  "dataCubeName": "wiki",
  "viewDefinitionVersion": "3",
  "viewDefinition": {
    "visualization": "totals",
    "timezone": "Etc/UTC",
    "filters": [
      {
        "type": "time",
        "ref": "time",
        "timeRanges": [
          {
            "start": "2015-09-10Z",
            "end": "2015-09-20Z"
          }
        ]
      }
    ],
    "splits": [],
    "measures": {
      "isMulti": true,
      "single": "count",
      "multi": [ "count", "delta", "added", "deleted" ]
    },
    "pinnedDimensions": [ "page" ],
    "pinnedSort": "count"
  }
}
```

Posting this will produce:

```json
{
  "hash": "#wiki/3/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9AJTjYA5rRnyQUEpLTMATAAYAjAFYAtM4Ccn1868zs54waHOAHTBzgBaQrTYACZObl6+ni5BIWHBUcFxAL4AusWUUMpIaFZFlHRwsNoyoNAAsjDiEPhokjC0ZRDmCGog7Jgw2A617Rj4siNjE0KJtOJwQnCJy8mUy0MSySWUygPYtIkAIjQJUFjYViDKcBYgNQ8nZwDKmPbMo+OTICGFiS+FAiSud1uvwAFqZTgghGBEL0miBnMwEkJXMwIA4CpRYVAAHLtBF4YSkWj4kDQiBmaFIekOPDYUkFIA"
}
```


### Example 2

Here is an example that will display the `line-chart` visualization filtered on: the last 1 day of data (`P1D`),
comment lengths not between 20 and 30, and city name being one of "London" or "Rome", split on `channel`
and `time` (bucketed by hour - `PT1H`) with `count` measure selected. Additionally, "Is Robot" dimension is pinned,
channels: "en" and "it" are the only visible plots on a line chart and a period between 12pm and 1pm
is highlighted on a graph.

```json
{
  "dataCubeName": "wiki",
  "viewDefinitionVersion": "3",
  "viewDefinition": {
    "visualization": "line-chart",
    "timezone": "Etc/UTC",
    "filters": [
      {
        "type": "time",
        "ref": "time",
        "timePeriods": [
          {
            "duration": "P1D",
            "type": "latest",
            "step": -1
          }
        ]
      },
      {
        "type": "number",
        "ref": "commentLength",
        "ranges": [
          {
            "start": 20,
            "end": 30,
            "bounds": "[)"
          }
        ],
        "not": true
      },
      {
        "type": "string",
        "ref": "cityName",
        "action": "in",
        "values": [
          "London",
          "Rome"
        ],
        "not": false
      }
    ],
    "splits": [
      {
        "type": "string",
        "dimension": "channel",
        "sort": {
          "ref": "delta",
          "direction": "descending"
        }
      },
      {
        "type": "time",
        "dimension": "time",
        "granularity": "PT1H",
        "sort": {
          "ref": "time",
          "direction": "ascending"
        }
      }
    ],
    "measures": {
      "isMulti": true,
      "single": "count",
      "multi": [ "count" ]
    },
    "pinnedDimensions": [ "isRobot" ],
    "pinnedSort": "count",
    "legend": {
      "dimension": "channel",
      "values": {
        "0": "en",
        "1": "it"
      },
      "hasNull": false
    },
    "highlight": {
      "owner": "line-chart",
      "filters": [
        {
          "type": "time",
          "ref": "time",
          "timeRanges": [
            {
              "start": "2015-09-12T12:00:00.000Z",
              "end": "2015-09-12T13:00:00.000Z"
            }
          ]
        }
      ],
      "measure": "count"
    }
  }
}
```

Posting the above view definition will produce:

```json
{
  "hash": "#wiki/3/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADQgYC2xyOx+IAomuQHoAqgBUAwoxAAzCAjTEaUfAG1QaAJ4AHLgVZcmNYlO57JegAoKsAEyV5VIazBrosuAuYCMAETNadhOjEUPRMIcSa+KSeAL4AujEMav7c2DAsAEYKkobGBOSYLGzYaAAyxNgA5miUktiY9HhoNDDEBnBVwSqgIbSNAEwADEwV1vgAzMMgGZgw2LbcygCUIPGJydrcITQQVTlG3OQQGgBycGyScOQYONy7kmCIrXbKIKU41rdMAEqFXHFMeqNKSIKDEeJhTRINAvDYBba7SqSawQYpQNyHajYEgISRQTB0fCgXLcazEORwZEQQzXDEEMlQcijRGrJhIFjHfBpBAIdbMFK6VH6RxC7Do26Ci5MSoubm0Y7qbjmESeAASeIJjWJB0lwpRNJu7hAcEZzL2iUIqM5eG5vIBIDYJucXTwoGgAFkYHIIPhmq0woiEAECnNQg6vRgVCAQyUQAkmJpdiRrN5ReKxVHoL8ZvR7YnscRrABlTWHWaxtnESqjIkitF06NYnEPJ4u0CDbgVSSeO70C3UKAnL24vAghBg/sQSqUJDTrUgTAAdxING4RDIVD6khkcgUsP5m11+zyzCFZiF3w61f3vUJBCGngArKRBgBOaL9FX9PCDQY/wYAHS/oMABakg1vegxPi+76eJ+njjP+/5Ab+YFrPajqwIYZahqsMRAA"
}
```
