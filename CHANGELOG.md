# Change Log

For updates follow [@implydata](https://twitter.com/implydata) on Twitter.

## 0.9.17

- Added better small screen support
- Fixed dragging polyfill (on touch devices)
- Added file notices

## 0.9.16

- Selected filtered items appear at top of menu

## 0.9.15

- Allow continuous dimension in two split line chart
- User menu everywhere

## 0.9.14

- New home view
- Added descriptions to data sources

## 0.9.13

- New plywood with fix for: https://github.com/implydata/plywood/pull/121

## 0.9.12

- New plywood fixes bugs

## 0.9.11

- Do not shrinkwrap npm modules

## 0.9.10

- Fix sort ordering of granularities in the granularity picker
- Single measure mode will re-sort on click
- Configurable timezones

## 0.9.9

- Auto generated config links to a github tag
- Fix config auto-generator printing out `defaultSelectedMeasures: []` 

## 0.9.8

- Early detection of (invalid) data sources that have a measure and dimension of the same name
- Prevention of making data sources with measures and dimensions of the same name 

## 0.9.7

- Tiny style fix

## 0.9.6

- Fix sourceListScan introspection to introspect unknown sources as they appear

## 0.9.5

- Fixed display of exclusion filters 
- Ensure cluster connection prior to starting introspection

## 0.9.4

- Exclusion filters

## 0.9.3

- Removed tests, docs, resources, e.t.c from npm module

## 0.9.2

- Change sourceListScan back to default to auto
- Typos and misc error message improvements

## 0.9.1

- Complete refactor of settings architecture
- Settings can be updated at runtime
- Pivot can connect to multiple clusters
- Pivot can connect to Postgres and MySQL
- Full support of Druid 0.9.1
- Auth module versioning
- Command line flag changes (see [writeup](docs/pivot-0.9.x-migration.md))
- Druid Request decorator changes (see [writeup](docs/pivot-0.9.x-migration.md))
- Ability to [generate programmatic links](docs/generating-links-into-pivot.md) into Pivot
- Ability to configure `serverHost`
- Auto refresh icon rotation
- Pivot is npm shrinkwrapped
- Better dimension / measure panel scaling 

## 0.8.42

- Fixed bug in Print config and added CLI tests

## 0.8.41

- New overflow style in split bar also
- Ability to define defaultSelectedMeasures
- Misc fixes for time filter rendering

## 0.8.40

- New Plywood adds support for native quantiles
- New filter menu overflow style

## 0.8.39

- Fixed example config

## 0.8.38

- Continuous dimension filtering and splitting

## 0.8.37

- Fixed small bar bug

## 0.8.36

- Misc query improvements from new Plywood 

## 0.8.35

- Two splits with scrolling in bar chart
- Pivot will only query within server root

## 0.8.34

- New table scroller
- About dialog shows version

## 0.8.33

- Fixed error when going from Time Series to Bar Chart

## 0.8.32

- Configurable server root (default: `/pivot`)

## 0.8.31

- Support and auto detection for Theta sketches (for countDistinct() only for now) 

## 0.8.30

- Horizontal bars in Table
- Misc visualization selection fixes

## 0.8.29

- Side panel resizing

## 0.8.28

- Visualization class refactor
- Table highlight bubble now shows full value
- Better word wrapping in highlight bubbles
- New Plywood ensures to send UTC timestamps to Druid
- Ability to define custom granularities for bucketing

## 0.8.27

- New chronoshift fixes bug with flooring `PT12H`
- Fix burger menu overflow

## 0.8.26

- Better time axis for tiny intervals

## 0.8.25

- New Plywood (0.10.14)

## 0.8.24

- Improved performance of raw data modal
- Added all US timezones

## 0.8.23

- Fixed npm publish issue

## 0.8.22

- Timezone support
- Date range picker
- Fixed X-axis labeling

## 0.8.21

- Build system works with node 6
- Ability to set custom page title

## 0.8.20

- Added pre-calculation pattern to visualizations
- Fixed bar chart on negative values 

## 0.8.19

- More robust cross browser dragging
- Faster incremental build system

## 0.8.18

- Better favicon
- Fixed natural bar chart order

## 0.8.17

- Build `gulp` will fail (exit 1) on error

## 0.8.16

- Fixed sort metric when following auto suggestion

## 0.8.15

- Export data to CSV
- New time series bubbles with hover logic
- Raw data modal allows you to see the raw data in the selected segment
- Better automatic config generation for data sources with URL unsafe names 

## 0.8.14

- Published due to script error (unpublished, please ignore)

## 0.8.13

- Published due to script error (unpublished, please ignore)

## 0.8.12

- New [customization options](https://github.com/implydata/pivot/blob/master/docs/configuration.md#customization)
- Updated favicon PNGs

## 0.8.11

- New Plywood fixes introspection of [JS ingestion aggregates](https://groups.google.com/forum/#!topic/imply-user-group/lC68IA79hYg) 

## 0.8.10

- 'Goto Url' option added

## 0.8.9

- New plywood fixes startup [bug](https://github.com/implydata/pivot/issues/150).

## 0.8.8

- Re-releasing

## 0.8.7

- New plywood fixes `timeFloor`, allows select sorting
- Fixed broken travis tests being merged in 

## 0.8.6

- New plywood

## 0.8.5

- Bubble refactor
- Copy selected value option in bubbles
- Fix bug in selecting measures in totals

## 0.8.4

- Fix SVG sizing in IE Edge

## 0.8.3

- Added search in Dimensions and Measures panels

## 0.8.2

- Added UI loader and chucked up main pivot JS blob into two
- Added ability to [decorate requests](/docs/security.md)

## 0.8.1

- Started this changelog
- Added Bar Chart visualization
- Added About modal
- Single measure mode
