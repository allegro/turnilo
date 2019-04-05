/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dataset, Datum } from "plywood";
import * as React from "react";
import "./heat-map.scss";
import { HeatMapRectangles } from "./heatmap-rectangles";
import { SPLIT } from "../../config/constants";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { Scroller } from "../../components/scroller/scroller";
import { Essence } from "../../../common/models/essence/essence";
import { MousePosition } from "../../utils/mouse-position/mouse-position";

interface Props {
  essence: Essence;
  dataset: Datum[];
  handleRectangleHover?(bin: any): void;
  hideTooltip?(): void;
  mouseHoverCoordinates?: MousePosition;
}

export class LabelledHeatmap extends React.PureComponent<Props> {
  render() {
    const { dataset, handleRectangleHover, hideTooltip, mouseHoverCoordinates } = this.props;

    const [measure] = this.props.essence.getEffectiveSelectedMeasures().toArray();
    const [firstSplit, secondSplit] = this.props.essence.splits.splits.toArray();

    const leftLabels = dataset.map(datum => formatValue(
      datum[firstSplit.reference],
      this.props.essence.timezone,
      { formatOnlyStartDate: true }
    ));
    const topLabels = (dataset[0][SPLIT] as Dataset).data.map(datum => formatValue(
      datum[secondSplit.reference],
      this.props.essence.timezone,
      { formatOnlyStartDate: true }
    ));

    return (
      <Scroller
        layout={{
          bodyHeight: leftLabels.length * 25,
          bodyWidth: topLabels.length * 25,
          top: 120,
          right: 0,
          bottom: 0,
          left: 200
        }}
        topGutter={
          <div className="top-labels">
            {topLabels.map(label => <span key={label as string}><span>{label}</span></span>)}
          </div>
        }
        leftGutter={
          <div className="left-labels">
            {leftLabels.map(label => <div key={label as string}><span>{label}</span></div>)}
          </div>
        }
        topLeftCorner={<div className="top-left-corner-mask" />}
        body={[
          <HeatMapRectangles
            key="heatmap"
            onHover={handleRectangleHover}
            onHoverStop={hideTooltip}
            mouseHoverCoordinates={mouseHoverCoordinates}
            dataset={dataset}
            measureName={measure.name}
          />
        ]}
      />
    );
  }
}