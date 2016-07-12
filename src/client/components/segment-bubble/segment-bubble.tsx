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

require('./segment-bubble.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Dimension } from '../../../common/models/index';
import { clamp } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';
import { Shpitz } from '../shpitz/shpitz';
import { SegmentActionButtons } from '../segment-action-buttons/segment-action-buttons';

const OFFSET_V = -10;
const PER_LETTER_PIXELS = 8;

export interface SegmentBubbleProps extends React.Props<any> {
  left: number;
  top: number;
  dimension?: Dimension;
  segmentLabel?: string;
  measureLabel?: string;
  clicker?: Clicker;
  onClose?: Fn;
  openRawDataModal?: Fn;
}

export interface SegmentBubbleState {
  moreMenuOpenOn?: Element;
}

export class SegmentBubble extends React.Component<SegmentBubbleProps, SegmentBubbleState> {

  constructor() {
    super();
  }

  render() {
    const { left, top, dimension, segmentLabel, measureLabel, clicker, openRawDataModal, onClose } = this.props;

    var textElement: JSX.Element;
    if (segmentLabel) {
      var minTextWidth = clamp(segmentLabel.length * PER_LETTER_PIXELS, 80, 300);
      textElement = <div className="text" style={{ minWidth: minTextWidth }}>
        <div className="segment">{segmentLabel}</div>
        {measureLabel ? <div className="measure-value">{measureLabel}</div> : null}
      </div>;
    }

    var actionsElement: JSX.Element = null;

    if (clicker) {
      actionsElement = <SegmentActionButtons
        clicker={clicker}
        dimension={dimension}
        segmentLabel={segmentLabel}
        openRawDataModal={openRawDataModal}
        onClose={onClose}
      />;
    }

    return <BodyPortal left={left} top={top + OFFSET_V} disablePointerEvents={!clicker}>
      <div className="segment-bubble" ref="bubble">
        {textElement}
        {actionsElement}
        <Shpitz direction="up"/>
      </div>
    </BodyPortal>;
  }
}
