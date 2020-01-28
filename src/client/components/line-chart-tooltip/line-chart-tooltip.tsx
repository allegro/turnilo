/*
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TooltipWithBounds } from "@vx/tooltip";
import { Dataset, Datum, PlywoodRange } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { mapTruthy } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { SPLIT } from "../../config/constants";
import { JSXNode } from "../../utils/dom/dom";
import { ColorEntry, ColorSwabs } from "../color-swabs/color-swabs";
import { Delta } from "../delta/delta";
import { HighlightModal } from "../highlight-modal/highlight-modal";
import { MeasureBubbleContent } from "../measure-bubble-content/measure-bubble-content";
import { SegmentBubbleContent } from "../segment-bubble/segment-bubble";

const HOVER_BUBBLE_V_OFFSET = -7;
const HOVER_MULTI_BUBBLE_V_OFFSET = -8;

function splitRangeExtractor(dimensionName: string, range: PlywoodRange): (d: Datum) => Datum {
  return (d: Datum): Datum => {
    const dataset = d[SPLIT] as Dataset;
    return dataset != null ? dataset.findDatumByAttribute(dimensionName, range) : null;
  };
}

function measureLabel(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): JSXNode {
  const { splits: { splits }, dataCube } = essence;
  const continuousDimension = dataCube.getDimension(splits.first().reference);
  const datum = dataset.findDatumByAttribute(continuousDimension.name, range);
  if (!datum) return null;

  if (!essence.hasComparison()) {
    return series.formatValue(datum);
  }
  const currentValue = series.selectValue(datum);
  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const formatter = series.formatter();
  return <MeasureBubbleContent
    lowerIsBetter={series.measure.lowerIsBetter}
    current={currentValue}
    previous={previousValue}
    formatter={formatter} />;
}

interface HighlightTooltipProps {
  dataset: Dataset;
  series: ConcreteSeries;
  essence: Essence;
  acceptHighlight: Fn;
  dropHighlight: Fn;
  highlightRange: PlywoodRange;
  topOffset: number;
  leftOffset: number;
}

export function HighlightTooltip(props: HighlightTooltipProps): JSX.Element {
  const { series, leftOffset, topOffset, acceptHighlight, dropHighlight, essence, highlightRange, dataset } = props;
  const { colors, timezone } = essence;
  const segmentLabel = formatValue(highlightRange, timezone);

  if (colors) {
    return <HighlightModal
      left={leftOffset}
      top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
      title={segmentLabel}
      acceptHighlight={acceptHighlight}
      dropHighlight={dropHighlight}>
      <ColorSwabs
        colorEntries={colorEntries(dataset, highlightRange, series, essence)} />
    </HighlightModal>;
  } else {

    return <HighlightModal
      left={leftOffset}
      top={topOffset + HOVER_BUBBLE_V_OFFSET}
      title={segmentLabel}
      acceptHighlight={acceptHighlight}
      dropHighlight={dropHighlight}>
      {measureLabel(dataset, highlightRange, series, essence)}
    </HighlightModal>;
  }
}

interface HoverTooltipProps {
  dataset: Dataset;
  series: ConcreteSeries;
  essence: Essence;
  hoverRange: PlywoodRange;
  topOffset: number;
  leftOffset: number;
}

function colorEntries(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): ColorEntry[] {
  const { splits: { splits }, dataCube, colors } = essence;
  const categoryDimension = dataCube.getDimension(splits.first().reference);
  const continuousDimension = dataCube.getDimension(splits.get(1).reference);
  const hoverDatums = dataset.data.map(splitRangeExtractor(continuousDimension.name, range));
  const colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
  const hasComparison = essence.hasComparison();
  return mapTruthy(dataset.data, (d, i) => {
    const segment = d[categoryDimension.name];
    const hoverDatum = hoverDatums[i];
    if (!hoverDatum) return null;

    const currentEntry: ColorEntry = {
      color: colorValues[i],
      name: String(segment),
      value: series.formatValue(hoverDatum)
    };

    if (!hasComparison) {
      return currentEntry;
    }

    return {
      ...currentEntry,
      previous: series.formatValue(hoverDatum, SeriesDerivation.PREVIOUS),
      delta: <Delta
        currentValue={series.selectValue(hoverDatum)}
        previousValue={series.selectValue(hoverDatum, SeriesDerivation.PREVIOUS)}
        formatter={series.formatter()}
        lowerIsBetter={series.measure.lowerIsBetter}
      />
    };
  });
}

export function HoverTooltip(props: HoverTooltipProps): JSX.Element {
  const { leftOffset, topOffset, series, essence, hoverRange, dataset } = props;
  const { colors, timezone } = essence;
  const segmentLabel = formatValue(hoverRange, timezone);

  if (colors) {
    return <TooltipWithBounds
      key={Math.random()}
      left={leftOffset}
      top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}>
      <SegmentBubbleContent
        title={segmentLabel}
        content={<ColorSwabs
          colorEntries={colorEntries(dataset, hoverRange, series, essence)} />} />
    </TooltipWithBounds>;
  } else {
    return <TooltipWithBounds
      key={Math.random()}
      top={topOffset + HOVER_BUBBLE_V_OFFSET}
      left={leftOffset}>
      <SegmentBubbleContent
        title={segmentLabel}
        content={measureLabel(dataset, hoverRange, series, essence)} />
    </TooltipWithBounds>;
  }
}
