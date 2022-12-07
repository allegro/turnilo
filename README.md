# Turnilo

[![npm version](https://img.shields.io/npm/v/turnilo.svg)](https://www.npmjs.org/package/turnilo)
[![build status](https://github.com/allegro/turnilo/workflows/Build/badge.svg)](https://github.com/allegro/turnilo/actions)
[![Join our Slack chat](https://img.shields.io/badge/slack-chat-purple.svg?logo=slack)](https://join.slack.com/t/turnilo/shared_invite/enQtOTI4ODcxMjcyNjU2LTFlOTk5YWZlOGMyZDZhZWU3MGNjNDRhZmI1Y2UzNDlkZmY3YzYxYTJhYzIzMzc0MTc3MzA3OTE1NmQ5NDI1M2I)

Turnilo is a business intelligence, data exploration and visualization web application for [Apache Druid](https://druid.apache.org).
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
* Self-describing reports for users without deep domain expertise.
* Outstanding integration with Druid over support for other data sources like SQL databases.
* Focus on data visualizations over Druid cluster or data ingestion management.
* Data cubes configuration as a code over UI editor backed by non-versioned database.
* Stateless over stateful server-side architecture.
* Support for most recent versions of standards compliant browsers.

## Features

* Intuitive, drag and drop, gorgeous user interface to visualize Druid datasets.
* Fully dedicated to low latency Druid 
[Timeseries](https://druid.apache.org/docs/latest/querying/timeseriesquery.html), 
[TopN](https://druid.apache.org/docs/latest/querying/topnquery.html) and 
[GroupBy](https://druid.apache.org/docs/latest/querying/groupbyquery.html) queries.
* Unified view for historical and real-time data.
* Blazingly fast.

![Turnilo UI](https://github.com/allegro/turnilo/raw/master/docs/assets/images/showcase.gif)

## Try it!

You can try an online demo with example datasets (Covid-19 and Wikipedia) at [https://turnilo.app](https://turnilo.app).

## Join us!

Feel free to ask on [GitHub Discussions](https://github.com/allegro/turnilo/discussions)
or join the chat on [Slack](https://join.slack.com/t/turnilo/shared_invite/enQtOTI4ODcxMjcyNjU2LTFlOTk5YWZlOGMyZDZhZWU3MGNjNDRhZmI1Y2UzNDlkZmY3YzYxYTJhYzIzMzc0MTc3MzA3OTE1NmQ5NDI1M2I).

## Pre-requisites

* [Node.js](https://nodejs.org/) - 14.x or 16.x version

:warning:
Do not use `yarn` command for dependency management and project build, use `npm` instead.
With `npm` builds are reproducible (thanks to package-lock.json) and even faster than with `yarn`.

## Usage

Install Turnilo distribution using [npm](https://www.npmjs.com/).

```
npm install -g turnilo
```

Start off by running Turnilo with example datasets
and open [http://localhost:9090/](http://localhost:9090/).

```
turnilo run-examples
```

Use `connect-druid` command to connect to the existing Druid broker.
Turnilo will automatically introspect your Druid broker and figure out available datasets.

```
turnilo connect-druid http[s]://druid-broker-hostname[:port]
```

## Documentation

Learn how to configure and customize Turnilo:
[https://allegro.github.io/turnilo/](https://allegro.github.io/turnilo/)

## Development

### Install project dependencies.

```
npm install
```

### Build the project.

```
npm run build
```

### Run project

Run example datasets.

```
npm run start:examples
```

Connect to the existing Druid broker.

```
npm run start -- connect-druid http[s]://druid-broker-hostname[:port]
```

Connect to the existing Druid broker using your config file.

```
npm run start -- run-config path/to/config.yml
```

### Run project in developer mode

Every change in frontend code would recompile project and reload page.

Run example datasets.

```
npm run start:dev:examples
```

Connect to the existing Druid broker.

```
npm run start:dev -- connect-druid http[s]://druid-broker-hostname[:port]
```

Connect to the existing Druid broker using your config file.

```
npm run start:dev -- run-config path/to/config.yml
```


## Testing

### Unit tests

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

### End to end tests

Run all e2e tests. It will start Turnilo with example datasets in background.

```
npm run e2e
```

### End to end tests development

Run server

```
npm start:dev:examples
```

Run cypress interactive tools for e2e testing

```
npm run e2e:dev
```


## Debugging 

### Server module

In WebStorm\IntelliJ open "Run/Debug Configurations", click "Add New Configuration".
Next choose "Node.JS", set "JavaScript file" to "./bin/turnilo" 
and "Application parameters" to "--examples".

You can find more infrmation [here](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)

## Generating documentation locally

### Prerequisites

* [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
* [Bundler](https://bundler.io)

Go to the docs folder and:

1. Install `bundle install` or `update bundle` update dependencies
2. Run `bundle exec jekyll serve --livereload`
3. Open [http://localhost:4000/](http://localhost:4000/)

## License

**Turnilo** is published under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
