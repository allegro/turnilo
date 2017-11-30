# Turnilo

Turnilo is a business intelligence, data exploration and visualization web application for [Druid](http://druid.io/).
Turnilo was previously known as [Pivot](https://github.com/implydata/pivot) which is currently available under commercial licence only.
This is a fork of an stalled repository [https://github.com/yahoo/swiv](https://github.com/yahoo/swiv) 
with the latest version of Pivot under Apache license.

## Motivation

[Druid](https://github.com/druid-io/druid) is heavily used as business intelligence platform at [Allegro](https://allegro.tech/).
In order to gain wide adoption of non-technical users, Druid requires simple yet powerful UI.
In Allegro we have decided that we are going to continue Pivot development as an open source software,
this is how Turnilo emerged.


## Features

* Drag and drop intuitive user interface to visualize Druid datasets
* Fully integrated with Druid
* Real-time data support
* Blazingly fast

## Usage

### Build

Make sure you have latest [node](https://nodejs.org/) version (>= 8.x.x) installed.

Install project dependencies:

```
npm install
```

Install [gulp](https://gulpjs.com/) and build the project:

```
npm -g install gulp
gulp
```

### Run Wikipedia examples

Start off by running an example with Wikipedia page editions dataset and open [http://localhost:9090/](http://localhost:9090/):

```
./bin/swiv --examples
```

### Run with Druid

Next connect Swiv to your broker by simply pointing it to your broker host:

```
./bin/swiv --druid your.druid.broker.host:8082
```

Turnilo will automatically introspect your Druid cluster and figure out datasets.

## License

**Turnilo** is published under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
