# Imply Pivot

## Introduction

Pivot is an exploratory web-based visualization UI for Druid built on top of Plywood.
It is in a very early alpha stage, so don’t use it in production. (also the functionality isn’t complete)

## Interaction Examples

Drag-and-drop UI
<gif>

Time-series exploration
<gif>

Exploring with context
<gif>

## Usage

run this, then blah then point it to your druid cluster

## Roadmap

- schema and configuration management system
- support being embedded in your app to provide your users with analytics

## Contribution

if you have questions about pivot you can direct them (here)
we probably won’t accept pull requests at the moment as the code is not ready for that


# Run the project

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


# Develop the project

Instruction for developers to start developing the project.

After completing the "Run the project" steps above you should get yourself these useful global tools:

```
npm install -g gulp
npm install -g coffee-script
npm install -g browser-sync
```
