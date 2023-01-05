# How to Contribute

## General guidelines

- Bug reports, feature requests, and any sort of feedback is very welcome.
- Pull requests fixing bugs are very welcome as well.
- For pull requests involving any changes to the UI, please discuss them first in a GitHub issue.

## Add new visualization to Turnilo

### Initial setup

_[Example code for scatterplot setup](https://github.com/allegro/turnilo/pull/827)_

#### Set up a new type
Add your new `Visualization` type in [src/common/models/visualization-manifest/visualization-manifest.ts](https://github.com/allegro/turnilo/blob/master/src/common/models/visualization-manifest/visualization-manifest.ts).

#### Add a manifest
Add a new entry in [src/common/visualization-manifests/index.ts](https://github.com/allegro/turnilo/blob/master/src/common/visualization-manifests/index.ts).

Add a new instance of `VisualizationManifest` in [src/common/visualization-manifests/](https://github.com/allegro/turnilo/blob/master/src/common/visualization-manifests/)`<visualizationName>/<visualizationName>.ts`. You can use `emptySettingsConfig` for `visualizationSettings` in the beginning and add settings later if needed. Write an `evaluateRules` function to make sure your visualization is shown under certain conditions. If you need at least one split and one measure, it could look like this:

```
const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The <visualizationName> requires at least one split"))
  .when(Predicates.noSelectedMeasures())
  .then(Actions.manualMeasuresSelection())
  .otherwise(({ isSelectedVisualization }) =>
    Resolve.ready(isSelectedVisualization ? 10 : 3)
  )
  .build();
```

#### Allow choosing your visualization from the menu

* To render an icon add an SVG to [src/client/icons/](https://github.com/allegro/turnilo/blob/master/src/client/icons/). The file needs to have a `vis-` prefix, like so `vis-<visualizationName>.svg`.
* Make sure to handle the new visualization type in these files:
    * [src/client/components/vis-selector/vis-selector-menu.tsx](https://github.com/allegro/turnilo/blob/master/src/client/components/vis-selector/vis-selector-menu.tsx)
    * [src/client/visualization-settings/settings-component.ts](https://github.com/allegro/turnilo/blob/master/src/client/visualization-settings/settings-component.ts)

#### Add a new component

Create a new file [src/client/visualizations/](https://github.com/allegro/turnilo/blob/master/src/client/visualizations/)`<visualizationName>/<visualizationName>.tsx`.
Here you want to add the basis for your component with the visualization panel at the top:

```
const <visualizationName>: React.FunctionComponent<ChartProps> = () => {
    return <div>
        <h2>New visualization will be here!</h2>
    </div>;
};

export function <visualizationName>Visualization(props: VisualizationProps) {
    return <React.Fragment>
        <DefaultVisualizationControls {...props} />
        <ChartPanel {...props} queryFactory={makeQuery} chartComponent={<visualizationName>}/>
    </React.Fragment>;
```

Lastly, add `<visualizationName>Visualization` to the `VISUALIZATIONS` map in [src/client/visualizations/index.ts](https://github.com/allegro/turnilo/blob/master/src/client/visualizations/index.ts)

There you go! This should be enough to create a new visualization scaffold. Next step? Plotting your data.

### Basic visualization
_[Example code for scatterplot](https://github.com/allegro/turnilo/pull/831/files)_

In your new component you have all these [chart props](https://github.com/allegro/turnilo/blob/master/src/common/models/chart-props/chart-props.ts) at your disposal. In the beginning you will want to focus on `essence`, `stage`, `data`.

`essence` keeps the application state and here you can find e.g. chosen splits and series. `stage` gives you the information about the available space to render your visualization. Lastly, there's `data` which you want to present to the user. To select a dataset of interest, you can use functions from [src/client/utils/dataset/selectors/selectors.ts](https://github.com/allegro/turnilo/blob/master/src/client/utils/dataset/selectors/selectors.ts). Once you've found the data you want to plot, it is time to create a [scale](https://github.com/d3/d3/blob/main/API.md#scales-d3-scale). If, for example, you wanted to create a linear scale based on the `data` and `series` you have, you could code it like this:

```
const [min, max] = d3.extent(data, (d) => series.selectValue(d));

const scale = d3.scaleLinear.domain([min, max]).range([0, stage.width]);

const ticks = scale.ticks()
```

This should be enough to render a simple chart. Remember to use the same scale for axis, grids, and chart data. Be sure to check out `getViewBox()` and `getTransform()` methods of `stage`. They will help you position your visualization elements in the available space. If you're unfamiliar with SVG elements and their attributes, take a look at the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#svg_elements_by_category).

### Present data

#### Naming and formatting

We want to present data in an understandable way to the user. Make sure your visualization displays names of series or splits and has a title, if applicable. Here's a quick cheatsheet:

##### Series

* `series.title()` - get the series title
* `series.selectValue(datum)` - get data point of a given series
* `series.formatValue(datum)` - format data point of a given series
* `series.formatter()` - format series values _on an axis only_

##### Split

[Soon](https://github.com/allegro/turnilo/pull/849) using `selectValue` and `formatValue` will be supported in Turnilo as well.

#### Legend

If your visualization needs a legend, we have a spot designated just for this purpose. Inside your visualization component use the `LegendSpot` component, which will appear at the top of the pinboard through a React portal.
```
<LegendSpot>
    <h1>Example legend title here</h1>
</LegendSpot>
```

If you want to read how it is done in detail, check out
* [src/client/components/pinboard-panel/pinboard-panel.tsx](https://github.com/allegro/turnilo/blob/master/src/client/components/pinboard-panel/pinboard-panel.tsx),
* [src/client/utils/teleporter/teleporter.tsx](https://github.com/allegro/turnilo/blob/master/src/client/utils/teleporter/teleporter.tsx).

If you want to go straight to rendering a legend, check if `ColorSwabs` or `ColorLegend` is enough for your purposes. Otherwise create a new component in [src/client/components/](https://github.com/allegro/turnilo/blob/master/src/client/components/).

#### Tooltip

_[Example code for scatterplot](https://github.com/allegro/turnilo/pull/834/files)_

Currently Turnilo supports adding tooltips to visualizations in two ways (please disregard the `TooltipWithBounds` approach from the `@visx/tooltip` package). You will probably want to use `TooltipWithinStage`, where you can pass `stage` and the position to render the tooltip. Use `SegmentBubbleContent` to render content, like so:

```
<TooltipWithinStage left={leftPostion} top={topPosition} stage={stage}>
    <SegmentBubbleContent
        title="Tooltip title"
        content={<span>Content</span>}/>
</TooltipWithinStage>
```

There is also a possibility to replace `TooltipWithinStage` with `SegmentBubble`. This component will render the tooltip relative to the top left corner of the screen. When calculating its position you might need to include the width and height of top and left panels.

#### Timeshift Mode

Check if timeshift is chosen through `essence.hasComparison()`. To pick the previous value of a given data point in a series use `series.selectValue(datum, SeriesDerivation.PREVIOUS)`. To display the difference between current and previous values use the `Delta` component. See example usage in `Total` for visualization or in `SeriesBubbleContent` for tooltips.

### Add visualization settings
_[Example code for scatterplot](https://github.com/allegro/turnilo/pull/844/files)_

In [src/client/visualization-settings/](https://github.com/allegro/turnilo/blob/master/src/client/visualization-settings/)`<visualizationName>/<visualizationName>-settings.tsx` create a new `<visualizationName>SettingsComponent` with checkbox(es) to enable your additional settings.

Add your component to [src/client/components/vis-selector/vis-selector-menu.tsx](https://github.com/allegro/turnilo/blob/master/src/client/components/vis-selector/vis-selector-menu.tsx).

Add it again to [src/client/visualization-settings/settings-component.ts](https://github.com/allegro/turnilo/blob/master/src/client/visualization-settings/settings-component.ts).

Create `settings` in [src/common/visualization-manifests/](https://github.com/allegro/turnilo/blob/master/src/common/visualization-manifests/)`<visualizationName>/settings.ts`. This is a rather routine piece of code, so feel free to follow the pattern of other `settings` in visualization manifests.

Then import created `settings` to the manifest in [src/common/visualization-manifests/](https://github.com/allegro/turnilo/blob/master/src/common/visualization-manifests/)`<visualizationName>/<visualizationName>.ts`

Add changes to your visualization component based on `essence.visualizationSettings`.

### Add end-to-end tests
_[Example tests for scatterplot](https://github.com/allegro/turnilo/pull/846)_

We add tests in order to make sure we don't introduce a regression later on. To write e2e tests in Turnilo we use [Cypress](https://www.cypress.io/).

To start writing your tests, create a new file `<visualizationName>.spec.js` in [cypress/integration/](https://github.com/allegro/turnilo/blob/master/cypress/integration/) directory.

Basically what you want to achieve is to make Cypress enter a given URL at the beginning of each test case, find pieces of your visualization using CSS selectors and make an assertion. Take a look at the list of [common assertions](https://docs.cypress.io/guides/references/assertions#Common-Assertions) when adding your own.
