---
title: Application performance
nav_order: 10
layout: page
---
  
## Overview

An important aspect of Turnilo is its web performance.
Upon every change to the codebase we should track how performance changes.

## JS bundle size

Bundle size can easily inflate, particularly when an app has plenty of dependencies, just like Turnilo.
With every change we should keep track of the bundle size, especially when we add a new dependency.

Before adding a new dependency, please consider a smaller alternative in terms of bundle size.
Tools like [Bundlephobia](https://bundlephobia.com/) will help to recon cost of library and find alternatives.

### Size-limit

[Size-limit GitHub Action](https://github.com/marketplace/actions/size-limit-action) will help to stay with assets size in the budget.
On each pull request this action will post a comment with current bundle size and its delta.

**Each time budgets are exceeded CI will fail.**

You can adjust budgets in `size-limit` section of `package.json`.

### Bundle analysis by Statoscope

On every build a report about Webpack's bundle is made by [Statoscope](https://statoscope.tech/).
You can find these under `build/report-*.html`.
Among others, it offers detailed tree-map of the client bundle.
For example, it helps to figure out which dependencies are the heaviest.

### Transpiling dependencies

Usually pre-transpiled dependencies are bad for bundle size, since they can include utilities like Babel's helpers or TS' `tslib`. It's a problem because stuff like this is unnecessary for modern browsers and hence it should not be included in the bundle.
If possible import dependencies from an untraspiled source.
Any dependency that has to be transpiled should be [listed within Webpack configuration](../config/webpack.common.js#28).

### Manual (dead) code elimination

Sometimes we can't rely on libraries' authors or on Webpack in terms of tree-shaking aka dead-code-elimination, and we have to take matters into our own hands.

Webpack by [`IgnorePlugin`](https://webpack.js.org/plugins/ignore-plugin/) allows to drop selected modules and this [how Moment's locales are not included in the final bundle](../config/webpack.common.js#45).

## Lighthouse

On each pull request [Lighthouse-CI](https://github.com/GoogleChrome/lighthouse-ci) action will post link to lighthouse report. It can help to measure current performance and notice potential performance issues.
