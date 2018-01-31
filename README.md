# Turnilo

[![npm version](https://img.shields.io/npm/v/turnilo.svg)](https://www.npmjs.org/package/turnilo)
[![build status](https://travis-ci.org/allegro/turnilo.svg?branch=master)](https://travis-ci.org/allegro/turnilo)

Turnilo is a business intelligence, data exploration and visualization web application for [Druid](http://druid.io/).
Turnilo is a fork of [Pivot](https://github.com/implydata/pivot) which is currently available under commercial licence only.
This repository was forked from the stalled repository [Swiv](https://github.com/yahoo/swiv) 
with the latest version of Pivot under Apache license.

## Motivation

[Druid](https://github.com/druid-io/druid) is heavily used as business intelligence platform at [Allegro](https://allegro.tech/).
In order to gain wide adoption of non-technical users, Druid requires simple yet powerful user interface.
In Allegro we have decided that we are going to continue Pivot development as an open source software,
this is how Turnilo emerged.


## Features

* Intuitive, drag and drop, gorgeous user interface to visualize Druid datasets
* Fully dedicated to low latency Druid 
[Timeseries](http://druid.io/docs/latest/querying/timeseriesquery.html), 
[TopN](http://druid.io/docs/latest/querying/topnquery.html) and 
[GroupBy](http://druid.io/docs/latest/querying/groupbyquery.html) queries.
* Unified view for historical and real-time data
* Blazingly fast

![Turnilo UI](https://github.com/allegro/turnilo/raw/master/docs/images/drag-and-drop.gif)

## Usage

### Build

Make sure you have latest [node](https://nodejs.org/) version (>= 8.x.x) installed.

Install project dependencies:

```
npm install
```

Build the project:

```
npm run build
```

### Run Wikipedia examples

Start off by running an example with Wikipedia page editions dataset and open [http://localhost:9090/](http://localhost:9090/):

```
npm run start -- --examples
```

### Run with Druid

Next connect Turnilo to Druid cluster by simply pointing it to broker host:

```
npm run start -- --druid your.druid.broker.host (default to 8082)
```

Turnilo will automatically introspect your Druid cluster and figure out datasets.

## Running tests

Application has three ability to call unit tests:

client side part
```
npm run test:client
```

common part (server/client side)
```
npm run test:common
```

server side part
```
npm run test:server
```

To run all unit test client, common, server
```
npm run test
```

## Debugging in WebStorm

In WebStorm open "Run/Debug Configurations", click "Add New Configuration". Next choose "JavaScript Debug", set URL property to "localhost:9090" click OK.

More information you can find [here](https://www.jetbrains.com/help/webstorm/debugging-typescript.html)

## License

**Turnilo** is published under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
