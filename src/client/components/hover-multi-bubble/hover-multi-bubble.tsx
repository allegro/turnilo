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

require('./hover-multi-bubble.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Dimension } from '../../../common/models/index';
import { BodyPortal } from '../body-portal/body-portal';
import { SegmentActionButtons } from '../segment-action-buttons/segment-action-buttons';

const LEFT_OFFSET = 22;

export interface ColorEntry {
  color: string;
  segmentLabel: string;
  measureLabel: string;
}

export interface HoverMultiBubbleProps extends React.Props<any> {
  left: number;
  top: number;
  dimension?: Dimension;
  segmentLabel?: string;
  colorEntries?: ColorEntry[];
  clicker?: Clicker;
  onClose?: Fn;
}

export interface HoverMultiBubbleState {
}

export class HoverMultiBubble extends React.Component<HoverMultiBubbleProps, HoverMultiBubbleState> {
  public mounted: boolean;

  constructor() {
    super();
  }

  renderColorSwabs(): JSX.Element {
    const { colorEntries } = this.props;
    if (!colorEntries || !colorEntries.length) return null;

    var colorSwabs = colorEntries.map((colorEntry) => {
      const { color, segmentLabel, measureLabel } = colorEntry;
      var swabStyle = { background: color };
      return <div className="color" key={segmentLabel}>
        <div className="color-swab" style={swabStyle}></div>
        <div className="color-name">{segmentLabel}</div>
        <div className="color-value">{measureLabel}</div>
      </div>;
    });

    return <div className="colors">{colorSwabs}</div>;
  }

  render() {
    const { left, top, dimension, segmentLabel, clicker, onClose } = this.props;

    return <BodyPortal left={left + LEFT_OFFSET} top={top} disablePointerEvents={!clicker}>
      <div className="hover-multi-bubble">
        <div className="bucket">{segmentLabel}</div>
        {this.renderColorSwabs()}
        {clicker ? <SegmentActionButtons clicker={clicker} dimension={dimension} segmentLabel={segmentLabel} disableMoreMenu={true} onClose={onClose}/> : null}
      </div>
    </BodyPortal>;
  }
}
