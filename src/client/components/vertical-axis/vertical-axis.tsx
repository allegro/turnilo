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

import * as React from "react";
import { Measure, Stage } from "../../../common/models/index";
import { formatterFromData } from "../../../common/utils/formatter/formatter";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./vertical-axis.scss";

const TICK_WIDTH = 5;
const TEXT_OFFSET = 2;

export interface VerticalAxisProps {
  stage: Stage;
  ticks: number[];
  scale: any;
  topLineExtend?: number;
  hideZero?: boolean;
}

export interface VerticalAxisState {
}

export class VerticalAxis extends React.Component<VerticalAxisProps, VerticalAxisState> {
  static defaultProps: Partial<VerticalAxisProps> = {
    topLineExtend: 0
  };

  render() {
    var { stage, ticks, scale, topLineExtend, hideZero } = this.props;

    if (hideZero) ticks = ticks.filter((tick: number) => tick !== 0);

    var formatter = formatterFromData(ticks, Measure.DEFAULT_FORMAT);

    var lines = ticks.map((tick: any) => {
      var y = roundToHalfPx(scale(tick));
      return <line className="tick" key={String(tick)} x1={0} y1={y} x2={TICK_WIDTH} y2={y} />;
    });

    var labelX = TICK_WIDTH + TEXT_OFFSET;
    var dy = "0.31em";

    var labels = ticks.map((tick: any) => {
      var y = scale(tick);
      return <text className="tick" key={String(tick)} x={labelX} y={y} dy={dy}>{formatter(tick)}</text>;
    });

    return <g className="vertical-axis" transform={stage.getTransform()}>
      <line className="border" x1={0.5} y1={-topLineExtend} x2={0.5} y2={stage.height} />
      {lines}
      {labels}
    </g>;
  }
}
