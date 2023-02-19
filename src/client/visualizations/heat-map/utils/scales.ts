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

import { scaleLinear } from "@visx/scale";
import * as d3 from "d3";
import { Datum } from "plywood";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
import { Unary } from "../../../../common/utils/functional/functional";
import { LinearScale } from "../../../utils/linear-scale/linear-scale";
import { nestedDataset } from "./nested-dataset";

export type ColorScale = d3.ScaleLinear<string, string>;

const white = "#fff";

interface Scales {
  x: LinearScale;
  y: LinearScale;
  color: ColorScale;
}

function seriesSelector(series: ConcreteSeries): Unary<Datum, number> {
  return (d: Datum) => series.selectValue(d);
}

export default function scales(dataset: Datum[], tileSize: number, mainColor: string, series: ConcreteSeries): Scales {
  const bucketSizeMax = d3.max(dataset, d => nestedDataset(d).length) || 0; // d3.max returns undefined if collection is empty
  const dataLength = dataset.length;

  const width = bucketSizeMax * tileSize;
  const height = dataLength * tileSize;

  const x = scaleLinear({
    domain: [0, bucketSizeMax],
    range: [0, width]
  });

  const y = scaleLinear({
    domain: [dataLength, 0],
    range: [height, 0]
  });

  const select = seriesSelector(series);

  const colorMin = d3.min(dataset, d => d3.min(nestedDataset(d), select));
  const colorMax = d3.max(dataset, d => d3.max(nestedDataset(d), select));

  const color = scaleLinear<string>({
    range: [white, mainColor],
    domain: [Math.min(colorMin, 0), colorMax]
  });

  return { x, y, color };
}
