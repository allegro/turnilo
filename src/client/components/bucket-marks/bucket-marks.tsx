/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./bucket-marks.css');

import * as React from 'react';
import { PlywoodValue } from 'plywood';
import { Stage } from '../../../common/models/index';
import { roundToHalfPx } from '../../utils/dom/dom';

const TICK_HEIGHT = 5;

export interface BucketMarksProps extends React.Props<any> {
  stage: Stage;
  ticks: PlywoodValue[];
  scale: any;
}

export interface BucketMarksState {
}

export class BucketMarks extends React.Component<BucketMarksProps, BucketMarksState> {
  constructor() {
    super();
  }

  render() {
    const { stage, ticks, scale } = this.props;
    var stageWidth = stage.width;

    var lines: JSX.Element[] = [];
    function addLine(x: number, key: string) {
      if (stageWidth < x) return;
      lines.push(<line key={key} x1={x} y1={0} x2={x} y2={TICK_HEIGHT}/>);
    }

    for (var tick of ticks) {
      var x = roundToHalfPx(scale(tick));
      addLine(x, '_' + tick);
    }
    if (ticks.length) {
      var x = roundToHalfPx(scale(ticks[ticks.length - 1]) + scale.rangeBand());
      addLine(x, 'last');
    }

    return <g className="bucket-marks" transform={stage.getTransform()}>
      {lines}
    </g>;
  }
}
