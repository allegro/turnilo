/*
 * Copyright 2017-2018 Allegro.pl
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

import { Timezone } from "chronoshift";
import { List, OrderedMap } from "immutable";
import { Dataset, Datum } from "plywood";
import { NORMAL_COLORS } from "../../../../../common/models/colors/colors";
import { Dimension } from "../../../../../common/models/dimension/dimension";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Split } from "../../../../../common/models/split/split";
import { selectFirstSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { getContinuousSplit, getNominalDimension, getNominalSplit, hasNominalSplit } from "../../../line-chart/utils/splits";

enum ChartModeId { NORMAL, STACKED }

interface ChartModeBase {
  id: ChartModeId;
  continuousSplit: Split;
  timezone: Timezone;
  hasComparison: boolean;
  series: List<ConcreteSeries>;
}

export interface NormalMode extends ChartModeBase {
  id: ChartModeId.NORMAL;
}

type Color = string;

type ColorMap = OrderedMap<string, Color>;

export interface StackedMode extends ChartModeBase {
  id: ChartModeId.STACKED;
  colors: ColorMap;
  nominalSplit: Split;
  nominalDimension: Dimension;
}

export type BarChartMode = NormalMode | StackedMode;

export function isStacked(mode: BarChartMode): mode is StackedMode {
  return mode.id === ChartModeId.STACKED;
}

export function isNormal(mode: BarChartMode): mode is NormalMode {
  return mode.id === ChartModeId.NORMAL;
}

export function create(essence: Essence, dataset: Dataset): BarChartMode {
  const continuousSplit = getContinuousSplit(essence);
  const hasComparison = essence.hasComparison();
  const timezone = essence.timezone;
  const series = essence.getConcreteSeries();
  const commons = {
    continuousSplit,
    hasComparison,
    timezone,
    series
  };
  if (!hasNominalSplit(essence)) {
    return {
      ...commons,
      id: ChartModeId.NORMAL
    };
  }
  const nominalSplit = getNominalSplit(essence);
  const nominalDimension = getNominalDimension(essence);
  const nominalReference = nominalSplit.reference;
  const datums = selectFirstSplitDatums(dataset);
  const colors = datums.reduce<ColorMap>((map: ColorMap, datum: Datum, i: number) => {
    const key = String(datum[nominalReference]);
    const colorIndex = i % NORMAL_COLORS.length;
    const color = NORMAL_COLORS[colorIndex];
    return map.set(key, color);
  }, OrderedMap<string, Color>());
  return {
    ...commons,
    id: ChartModeId.STACKED,
    nominalSplit,
    nominalDimension,
    colors
  };
}
