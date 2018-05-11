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

## Manifesto

* High usability for non-technical users over sophisticated but rarely used features.
* Focus on interactive data exploration over static predefined dashboards.
* Outstanding integration with Druid over support for other data sources like SQL databases.
* Focus on data visualizations over Druid cluster or data ingestion management.
* Data cubes configuration as a code over UI editor backed by non-versioned database.
* Stateless over stateful server-side architecture.
* Support for most recent versions of standards compliant browsers.

## Features

* Intuitive, drag and drop, gorgeous user interface to visualize Druid datasets
* Fully dedicated to low latency Druid 
[Timeseries](http://druid.io/docs/latest/querying/timeseriesquery.html), 
[TopN](http://druid.io/docs/latest/querying/topnquery.html) and 
[GroupBy](http://druid.io/docs/latest/querying/groupbyquery.html) queries.
* Unified view for historical and real-time data
* Blazingly fast

![Turnilo UI](https://github.com/allegro/turnilo/raw/master/docs/images/drag-and-drop.gif)

## Pre-requisites

* [Node.js](https://nodejs.org/) - LTS version.

:warning:
Do not use `yarn` command for dependency managment and project build, use `npm` instead.
With `npm` builds are reproducible (thanks to package-lock.json) and even faster than with `yarn`.

## Usage

Install Turnilo distribution using [npm](https://www.npmjs.com/).

```
npm install -g turnilo
```

Start off by running an example with Wikipedia page editions dataset 
and open [http://localhost:9090/](http://localhost:9090/).

```
turnilo --examples
```

Or connect to the existing Druid cluster using `--druid` command line option.
Turnilo will automatically introspect your Druid cluster and figure out available datasets.

```
turnilo --druid broker_host:broker_port
```

## Documentation

* [Configuration](docs/configuration.md)
* [Generating Links](docs/generating-links.md)
* [Health checking](docs/health-checking.md)

## Development

Install project dependencies.

```
npm install
```

Build the project.

```
npm run build:dev
```

Run Wikipedia examples.

```
npm run start:dev -- --examples
```

Connect to the existing Druid cluster.

```
npm run start:dev -- --druid broker_host:broker_port
```

### Testing

Run all unit tests.

```
npm run test
```

Or run tests separately for common, client and server modules.

```
npm run test:common
npm run test:client
npm run test:server
```

## Debugging 

### Client module

In WebStorm\IntelliJ open "Run/Debug Configurations", click "Add New Configuration".
Next choose "JavaScript Debug" and set URL property to "localhost:9090".

You can find more information [here](https://www.jetbrains.com/help/webstorm/debugging-typescript.html)

### Server module

In WebStorm\IntelliJ open "Run/Debug Configurations", click "Add New Configuration".
Next choose "Node.JS", set "JavaScript file" to "./bin/turnilo" 
and "Application parameters" to "--examples".

You can find more infrmation [here](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)
 
## License

**Turnilo** is published under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
