# Pivot

## Introduction

Pivot is a web-based exploratory visualization UI for [Druid](https://github.com/druid-io/druid) built on top of 
[Plywood](https://github.com/implydata/plywood). 

The project is currently at a very early alpha stage, and is _not suitable for production use_. 

We will be making periodic updates to the project and we ask that any early alpha users refrain from submitting bug reports at this time. 

## License

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Features

Drag-and-drop UI
<gif>

Contextual exploration
<gif>

## Usage

### Run the project

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
```

Then you are ready to

```
./run
```

### Develop the project

Instruction for developers to start developing the project.

After completing the "Run the project" steps above you should get yourself these useful global tools:

```
npm install -g gulp
npm install -g coffee-script
npm install -g browser-sync
```

## Roadmap

We will be working on:
- Time comparison visualization
- Additional visualizations
- Search dimension values
- Exclusion filters
- Being able to easily embed Pivot in your app
- Various additions, improvements and fixes to make the app more complete

## Questions & Support

Please direct all questions to our [user groups](https://groups.google.com/forum/#!forum/imply-user-group).
