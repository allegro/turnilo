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
import { VisualizationColors } from "../../../../../common/models/colors/colors";
import { ClientCustomization } from "../../../../../common/models/customization/customization";
import { Dimension } from "../../../../../common/models/dimension/dimension";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Split } from "../../../../../common/models/split/split";
import { Omit } from "../../../../../common/utils/functional/functional";
import { selectFirstSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { getContinuousSplit, getNominalDimension, getNominalSplit, hasNominalSplit } from "../../../line-chart/utils/splits";

enum ModelVariantId { BASE, STACKED }

interface BarChartModelCommons {
  variant: ModelVariantId;
  continuousSplit: Split;
  timezone: Timezone;
  hasComparison: boolean;
  series: List<ConcreteSeries>;
}

export interface BaseBarChartModel extends BarChartModelCommons {
  variant: ModelVariantId.BASE;
}

type Color = string;

type ColorMap = OrderedMap<string, Color>;

export interface StackedBarChartModel extends BarChartModelCommons {
  variant: ModelVariantId.STACKED;
  colors: ColorMap;
  nominalSplit: Split;
  nominalDimension: Dimension;
}

export type BarChartModel = BaseBarChartModel | StackedBarChartModel;

export function isStacked(model: BarChartModel): model is StackedBarChartModel {
  return model.variant === ModelVariantId.STACKED;
}

function readCommons(essence: Essence): Omit<BarChartModelCommons, "variant"> {
  const continuousSplit = getContinuousSplit(essence);
  const hasComparison = essence.hasComparison();
  const timezone = essence.timezone;
  const series = essence.getConcreteSeries();
  return {
    continuousSplit,
    hasComparison,
    timezone,
    series
  };
}

function createColorMap(nominalSplit: Split, dataset: Dataset, colors: VisualizationColors): ColorMap {
  const datums = selectFirstSplitDatums(dataset);
  return datums.reduce<ColorMap>((map: ColorMap, datum: Datum, i: number) => {
    const key = String(nominalSplit.selectValue(datum));
    const colorIndex = i % colors.series.length;
    const color = colors.series[colorIndex];
    return map.set(key, color);
  }, OrderedMap<string, Color>());
}

export function create(essence: Essence, dataset: Dataset, customization: ClientCustomization): BarChartModel {
  const { visualizationColors } = customization;
  const commons = readCommons(essence);
  if (!hasNominalSplit(essence)) {
    return {
      ...commons,
      variant: ModelVariantId.BASE
    };
  }
  const nominalSplit = getNominalSplit(essence);
  const nominalDimension = getNominalDimension(essence);
  const colors = createColorMap(nominalSplit, dataset, visualizationColors);
  return {
    ...commons,
    variant: ModelVariantId.STACKED,
    nominalSplit,
    nominalDimension,
    colors
  };
}
