# Swiv

Swiv is a web-based exploratory visualization UI for [Druid](https://github.com/druid-io/druid) built on top of 
[Plywood](https://github.com/implydata/plywood). 

Swiv is best used with [Druid](http://druid.io).
Internal and external APIs may change with little notice.

## Contribution

This is a community owned and operated project.  Contributions are welcome and all interaction is done via this git repository.  File issues, make pull requests and review them all here please.

## Features

**Drag-and-drop UI**

![Drag to Split](https://github.com/yahoo/swiv/raw/master/docs/images/drag-and-drop.gif)

**Contextual exploration**

![Time Highlight](https://github.com/yahoo/swiv/raw/master/docs/images/explore.gif)

**Comparisons**

![Time Highlight](https://github.com/yahoo/swiv/raw/master/docs/images/compare.gif)

## Usage

### Ensure that you have an up-to-date node

Make sure you have node (>= 4.x.x) installed. On MacOS with [homebrew](http://brew.sh/) you can do:

```
brew update
brew install node
```

### Install

Next simply run:

```
npm i -g yahoo-swiv
```

**That's it.** You are ready to Swiv.


### Example

Start off by running an example (static) dataset:

```
swiv --examples
```

### Run with Druid

Next connect Swiv to your broker by simply pointing it to your broker host

```
swiv --druid your.druid.broker.host:8082
```

Swiv will automatically introspect your Druid cluster and figure out your dimensions and measures.

**Note:** if Swiv starts up and gives you a query error it is most likely because it could not properly introspect your schema.
You probably have some *hyperUnique* column that Swiv is trying to SUM over.
You will have to provide Swiv with a config file as in the nest section.   

### Create a config

In general Swiv will never know your schema as well as you.
To get a better experience you should create a [config](https://github.com/yahoo/swiv/blob/master/docs/configuration.md) and provide it to Swiv.
The fastest way to create a config is to have Swiv do it for you.

```
swiv --druid your.druid.broker.host:8082 --print-config --with-comments > config.yaml
```

The `--print-config` option will make Swiv run through its regular introspection and then, instead of tarting a server, dump the YAML onto the stdout and exit.  

```
swiv --config config.yaml
```

Now open the config in your favorite editor and adjust to taste.
Make sure to read through the [documentation](https://github.com/yahoo/swiv/blob/master/docs/configuration.md) about the possible configuration options.

## Development

Here are the steps to clone Swiv and run it as a developer. 

Firstly make sure you have the latest node (>= 5.5.x) and gulp installed:

```
npm i -g gulp
```

Clone the project

```
git clone git@github.com:yahoo/swiv.git
cd swiv
```

Inside the swiv folder run:

```
npm install
gulp
```

Finally you have to create a `config.yaml` file. (or use the sample)

```
./bin/swiv --druid your.druid.broker.host:8082 --print-config --with-comments > config.yaml
```

The `--with-comments` flag adds docs about what goes into the config.

Then you are ready to

```
./bin/swiv --config config.yaml
```

We use [WebStorm 2016.1](https://www.jetbrains.com/webstorm/) to develop Swiv and the checked in `.idea` directory contains
all of the auto formatting and code styles. You are free to use any editor as all the build scripts are editor agnostic.

Running `gulp watch` will build the project and start all the automated watchers.

## Roadmap

**Recent improvements:**

- Exclusion filters
- Full support of Druid 0.9.1
- Swiv can connect to multiple clusters, also Postgres and MySQL
- Continuous dimension filtering and splitting
- Support for Druid Theta sketches (for countDistinct())
- Horizontal bars in Table
- Side panel resizing
- Ability to define custom granularities for bucketing
- Timezone support

For a full list of changes see our [CHANGELOG](CHANGELOG.md)

**We will be working on:**

- Additional visualizations (geo, heatmap)
- String / RegExp filters
- Removing strict limits on queries
- Bookmarks and dashboarding features
- Various additions, improvements and fixes to make the app more complete

## Questions & Support

Please file bugs and feature requests by opening an issue on GitHub, also questions can be asked via GitHub issues.
