---
title: Health checking
nav_order: 6
layout: page
---

## Overview

Turnilo instance's health is defined in terms of being able to communicate with all configured Druid brokers
and those brokers knowing about all segments in Zookeeper.

It can be checked by sending a GET request to a `healthEndpoint` path defined in Turnilo's server [configuration](configuration-cluster.md).

Healthy Turnilo instance responds with HTTP status 200 while an unhealthy one responds with the status of 503.
The body of a response contains health status of all configured brokers with optional error message on unhealthy brokers.

While processing the health checking request Turnilo server will send its own requests to all configured
druid clusters' brokers for `/druid/broker/v1/loadstatus` endpoint. It will check that all brokers responds within
individually defined cluster timeout (`healthCheckTimeout` property in [cluster properties](configuration-cluster.md#general-properties))
and that the response body contains `inventoryInitialized` flag set to `true`.
If any of the requests to brokers fail to meet the criteria defined above the Turnilo instance is marked as unhealthy.

## Response examples

Healthy response example:
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
    "clusters": [
        {
            "host": "localhost:8082",
            "message": "",
            "status": "healthy"
        }
    ],
    "status": "healthy"
}
```

Unhealthy response example:
```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8

{
    "clusters": [
        {
            "host": "localhost:8082",
            "message": "inventory not initialized",
            "status": "unhealthy"
        },
        {
            "host": "192.168.99.100:8082",
            "message": "connection error: 'Error: ESOCKETTIMEDOUT'",
            "status": "unhealthy"
        }
    ],
    "status": "unhealthy"
}
```
