---
title: Release management
nav_order: 7
layout: page
---

## Overview
  
Release management is automated by [Release It](https://github.com/release-it/release-it) with the following steps:

* Build & Test
* Bump version in package.json
* Commit, push and tag Git repository
* Create GitHub [release](https://github.com/allegro/turnilo/releases) with generated changelog
* Publish Turnilo package to the [npm](https://www.npmjs.com/package/turnilo) registry

## Final Release

Final release must be done on the master branch

Use [Final Release](https://github.com/allegro/turnilo/actions/workflows/release-final.yml) action and select "Run Workflow"

* Configure version increment, "minor" version will be increased during the release by default.
* Click "Run workflow" button

## Beta Release

Use [Beta Release](https://github.com/allegro/turnilo/actions/workflows/release-beta.yml) action and select "Run workflow"

First Beta Release

* Configure version increment, typically "minor" (e.g. if current final release is 1.31.1 the next beta will be 1.32.0-beta.0)
* Click "Run workflow" button 

Consecutive Beta Release

* Keep version increment empty and just click "Run workflow" button
