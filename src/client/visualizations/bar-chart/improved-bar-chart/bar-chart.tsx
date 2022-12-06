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

import React from "react";
import { ChartProps } from "../../../../common/models/chart-props/chart-props";
import { Stage } from "../../../../common/models/stage/stage";
import { MessageCard } from "../../../components/message-card/message-card";
import { Scroller } from "../../../components/scroller/scroller";
import { SPLIT } from "../../../config/constants";
import { selectMainDatum } from "../../../utils/dataset/selectors/selectors";
import { useSettingsContext } from "../../../views/cube-view/settings-context";
import { BarCharts } from "./bar-charts/bar-charts";
import { InteractionController } from "./interactions/interaction-controller";
import { Spacer } from "./spacer/spacer";
import { create, isStacked } from "./utils/bar-chart-model";
import { calculateLayout } from "./utils/layout";
import { stackDataset } from "./utils/stack-dataset";
import { transposeDataset } from "./utils/transpose-dataset";
import { getXDomain } from "./utils/x-domain";
import { createXScale } from "./utils/x-scale";
import { XAxis } from "./x-axis/x-axis";
import { YAxis } from "./y-axis/y-axis";

export const BarChart: React.FunctionComponent<ChartProps> = props => {
  const { customization } = useSettingsContext();
  const { data: dataset, essence, stage, highlight, acceptHighlight, dropHighlight, saveHighlight } = props;
  const model = create(essence, dataset, customization);

  const transposedDataset = transposeDataset(dataset, model);
  if (transposedDataset.length === 0) {
    return <MessageCard title="No data found. Try different filters."/>;
  }

  const { [SPLIT]: split, ...totals } = selectMainDatum(dataset);
  const data = isStacked(model) ? stackDataset(transposedDataset, model) : transposedDataset;
  const seriesCount = model.series.count();
  const domain = getXDomain(data, model);
  const barChartLayout = calculateLayout(stage, domain.length, seriesCount);
  const { scroller, segment } = barChartLayout;
  const xScale = createXScale(domain, segment.width);

  return <InteractionController
    xScale={xScale}
    model={model}
    datums={data}
    layout={barChartLayout}
    saveHighlight={saveHighlight}
    highlight={highlight}>
    {({
        onClick,
        onScroll,
        onMouseLeave,
        onMouseMove,
        interaction,
        scrollLeft
      }) => <Scroller
      layout={scroller}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onScroll={onScroll}
      onMouseMove={onMouseMove}
      leftGutter={<Spacer />}
      bottomLeftCorner={<Spacer />}
      bottomRightCorner={<Spacer />}
      body={<BarCharts
        interaction={interaction}
        datums={data}
        totals={totals}
        stage={segment}
        scrollLeft={scrollLeft}
        model={model}
        xScale={xScale}
        acceptHighlight={acceptHighlight}
        dropHighlight={dropHighlight} />}
      rightGutter={<YAxis
        model={model}
        datums={data}
        stage={Stage.fromSize(scroller.right, segment.height)} />}
      bottomGutter={<XAxis
        model={model}
        scale={xScale}
        stage={Stage.fromSize(segment.width, scroller.bottom)}
      />} />}
  </InteractionController>;
};
