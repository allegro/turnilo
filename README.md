# Pivot

Pivot is a web-based exploratory visualization UI for [Druid](https://github.com/druid-io/druid) built on top of 
[Plywood](https://github.com/implydata/plywood). 

The project is currently at a very early alpha stage, and is _not suitable for production use_. 

We will be making periodic updates to the project and we ask that any early alpha users stay up to date on the
latest version and refrain from submitting bug reports for outdated versions. 

## Features

**Drag-and-drop UI**

![Drag to Split](https://github.com/implydata/pivot/raw/master/assets/images/drag-to-split.gif)

**Time series exploration**

![Time Highlight](https://github.com/implydata/pivot/raw/master/assets/images/time-highlight.gif)

## Usage

### Run the project

Clone the project

```
git clone git@github.com:implydata/pivot.git
cd pivot
```

Make sure you have node (0.12.x)

```
brew update
brew install node
```

Also make sure you have the SASS lint gem:

```
gem install scss_lint
```

Next, inside the pivot folder run:

```
npm install
gulp all
```

Finally you have to create a `config.yaml` file. (or use the sample)

For information on what goes into the config please read the comments in the [sample config file](/config_sample.yaml)

```
cp config_sample.yaml config.yaml
```

Then you are ready to

```
./run
```

## Roadmap

We will be working on:
- Better time selection
- Time comparison visualization
- Additional visualizations
- Search dimension values
- Exclusion filters
- Being able to easily embed Pivot in your app
- Various additions, improvements and fixes to make the app more complete

## Questions & Support

Please direct all questions to our [user groups](https://groups.google.com/forum/#!forum/imply-user-group).
