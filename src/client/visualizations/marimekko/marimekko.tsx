/*
 * Copyright 2017-2022 Allegro.pl
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

import * as d3 from "d3";
import { sum } from "d3";
import { Dataset, Datum } from "plywood";
import React, { CSSProperties } from "react";
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { percentFormatter } from "../../../common/models/series/series-format";
import { Stage } from "../../../common/models/stage/stage";
import { flatMap } from "../../../common/utils/functional/functional";
import { mapValues } from "../../../common/utils/object/object";
import makeQuery from "../../../common/utils/query/visualization-query";
import { LegendSpot } from "../../components/pinboard-panel/pinboard-panel";
import { selectFirstSplitDatums, selectSplitDatums } from "../../utils/dataset/selectors/selectors";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import { useSettingsContext } from "../../views/cube-view/settings-context";
import { Legend } from "../line-chart/legend/legend";
import "./marimekko.scss";

function prepareData(data: Dataset, essence: Essence) {
  const series = essence.getConcreteSeries().first();
  const xSplit = essence.splits.getSplit(1);

  const ySplit = essence.splits.getSplit(0);

  const dataset = selectFirstSplitDatums(data);

  const baseYs = dataset.map(datum => ySplit.selectValue(datum));

  const xs: Record<string, Datum[]> = {};

  dataset.forEach(datum => {
    const nested = selectSplitDatums(datum);
    const yValue = ySplit.selectValue(datum);
    const y = {
      [ySplit.reference]: yValue
    };
    nested.forEach(splitDatum => {
      const x = String(xSplit.selectValue(splitDatum));
      if (xs[x] === undefined) {
        xs[x] = [];
      }
      xs[x].push({ ...splitDatum, ...y });
    });
  });

  const xs2 = mapValues(xs, (data, key): Datum => {
    const measure = {
      [series.plywoodKey()]: d3.sum(data, datum => series.selectValue(datum))
    };
    const x = {
      [xSplit.toKey()]: key
    };
    return {
      ...x,
      ...measure,
      nest: Dataset.fromJS(data)
    };
  });

  function stackYs(ys: Datum[]): Datum[] {
    const sorted = flatMap(baseYs, y => {
      const found = ys.find(datum => ySplit.selectValue(datum) === y);
      return found ? [found] : [];
    });
    return sorted.map((datum, index, coll) => {
      const y0 = sum(coll.slice(0, index), datum => series.selectValue(datum));

      return {
        ...datum,
        y0
      };
    });
  }

  const xs3 = Object.values(xs2)
    .sort((a, b) => series.selectValue(b) - series.selectValue(a))
    .map((datum, index, coll) => {
      const x0 = sum(coll.slice(0, index), d => series.selectValue(d));
      const stackedNest = stackYs((datum.nest as Dataset).data);
      return {
        ...datum,
        x0,
        nest: Dataset.fromJS(stackedNest)
      };
    });

  return xs3;
}

const X_AXIS_HEIGHT = 30;

const Marimekko: React.FunctionComponent<ChartProps> = props => {
  const { stage, data: dataset, essence } = props;
  const { dataCube: { dimensions } } = essence;
  const { customization } = useSettingsContext();
  const colors = customization.visualizationColors.series;
  const chartStage = new Stage({
    x: 10,
    y: 20,
    height: stage.height - 30,
    width: stage.width - 20
  });

  const series = essence.getConcreteSeries().first();

  const ySplit = essence.splits.getSplit(0);
  const xSplit = essence.splits.getSplit(1);
  const yDimension = findDimensionByName(dimensions, ySplit.reference);
  const colorValues = selectFirstSplitDatums(dataset).map(datum => String(ySplit.selectValue(datum)));

  const colorScale = d3.scaleOrdinal<string>()
    .range(colors)
    .domain(colorValues);

  const data = prepareData(dataset, essence);

  const total = sum(data, datum => series.selectValue(datum));
  const xScale = d3.scaleLinear()
    .range([0, chartStage.width])
    .domain([0, total]);

  const stackHeight = chartStage.height - X_AXIS_HEIGHT;

  return <>
    <LegendSpot>
      <Legend values={colorValues} title={ySplit.getTitle(yDimension)}/>
    </LegendSpot>
    <div className="absolute" style={chartStage.getLeftTop()}>
      {data.map(datum => {
        const x = series.selectValue(datum);
        const x0 = datum.x0 as number;
        const name = String(xSplit.selectValue(datum));
        const left = xScale(x0);
        const width = xScale(x);
        const ys = (datum.nest as Dataset).data;

        const yScale = d3.scaleLinear()
          .range([0, stackHeight])
          .domain([0, x]);

        return (
          <div className="absolute" style={{ left, width }} key={name}>
            <span>
              {name}: {series.formatter()(x)} ({percentFormatter(x / total)})
            </span>
            <div className="absolute" style={{ top: X_AXIS_HEIGHT }}>
              {ys.map(datum => {
                const y = series.selectValue(datum);
                const y0 = datum.y0 as number;
                const name = String(ySplit.selectValue(datum));

                const top = yScale(y0);
                const height = yScale(y);
                const width = xScale(x);

                const styles: CSSProperties = {
                  top,
                  height,
                  width,
                  backgroundColor: colorScale(name)
                };

                return <div
                  key={name}
                  className="absolute rect"
                  style={styles}
                >
                  <span>{name}: {series.formatter()(y)} ({percentFormatter(y / x)})</span>
                </div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  </>;
};

export default function marimekkoVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Marimekko}/>
  </React.Fragment>;
}
