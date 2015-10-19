# Pivot

Pivot is a web-based exploratory visualization UI for [Druid](https://github.com/druid-io/druid) built on top of 
[Plywood](https://github.com/implydata/plywood). 

The project is currently in the alpha stage and is undergoing rapid development.
Internal and external APIs may change with little notice.

## Features

**Drag-and-drop UI**

![Drag to Split](https://github.com/implydata/pivot/raw/master/assets/images/drag-to-split.gif)

**Time series exploration**

![Time Highlight](https://github.com/implydata/pivot/raw/master/assets/images/time-highlight.gif)

## Usage

### Ensure that you have an up-to-date node

Make sure you have node (4.x.x) installed. On MacOS with [homebrew](http://brew.sh/) you can do:

```
brew update
brew install node
```

### Install

Next simply run:

```
npm i -g imply-pivot
```

**That's it.** You are ready to Pivot.


### Example

Start of by running an example (static) dataset:

```
pivot --example wiki
```

### Run with Druid

Next connect Pivot to your broker by simply pointing it to your broker host

```
pivot --druid your.druid.broker.host:8082
```

Pivot will automatically introspect your Druid cluster and figure out your dimensions and measures.

**Note:** if Pivot starts up and gives you a query error it is most likely because it could not determine your schema.
You probably have some *hyperUnique* column that Pivot is trying to SUM over. You will have to provide Pivot with a config
your choice is ether to write a [full config](/config.yaml.sample) or to make a [tiny config](/hyper-unique-patch-config.yaml)
that simply tells Pivot about the hyperUnique measures.   

### Write a config

In general Pivot will never know your schema as well as you do so to get a better experience you might want to define a config file and pass it along.
Have a look at a the [sample config file](/config.yaml.sample) included in this repo to learn what properties are supported. 

```
pivot --druid your.druid.broker.host:8082 --config /path/to/your/config/file.yaml
```

### Run the project as a developer

Firstly make sure you have gulp installed globally:

```
npm i -g gulp
```

Clone the project

```
git clone git@github.com:implydata/pivot.git
cd pivot
```

Also make sure you have the SASS lint gem:

```
gem install scss_lint
```

Next, inside the pivot folder run:

```
npm install
gulp
```

Finally you have to create a `config.yaml` file. (or use the sample)

For information on what goes into the config please read the comments in the [sample config file](/config.yaml.sample)

```
cp config.yaml.sample config.yaml
```

Then you are ready to

```
./bin/pivot --config config.yaml
```


## Roadmap

We will be working on:
- Better time selection
- Time comparison visualization
- Additional visualizations
- Exclusion filters
- Being able to easily embed Pivot in your app
- Various additions, improvements and fixes to make the app more complete

## Questions & Support

Please direct all questions to our [user groups](https://groups.google.com/forum/#!forum/imply-user-group).
