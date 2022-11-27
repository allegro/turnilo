/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as d3 from "d3";
import { PlywoodValue } from "plywood";
import React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./bucket-marks.scss";

const TICK_HEIGHT = 5;

export interface BucketMarksProps {
  stage: Stage;
  ticks: PlywoodValue[];
  scale: d3.ScaleBand<PlywoodValue>;
}

export interface BucketMarksState {
}

export class BucketMarks extends React.Component<BucketMarksProps, BucketMarksState> {

  render() {
    const { stage, ticks, scale } = this.props;
    const stageWidth = stage.width;

    const lines: JSX.Element[] = [];

    function addLine(x: number, key: string) {
      if (stageWidth < x) return;
      lines.push(<line key={key} x1={x} y1={0} x2={x} y2={TICK_HEIGHT} />);
    }

    for (const tick of ticks) {
      const x = roundToHalfPx(scale(tick));
      addLine(x, "_" + tick);
    }
    if (ticks.length) {
      const x = roundToHalfPx(scale(ticks[ticks.length - 1]) + scale.bandwidth());
      addLine(x, "last");
    }

    return <g className="bucket-marks" transform={stage.getTransform()}>
      {lines}
    </g>;
  }
}
