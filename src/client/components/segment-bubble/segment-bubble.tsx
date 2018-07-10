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
import { Clicker, Dimension } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { clamp } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { SegmentActionButtons } from "../segment-action-buttons/segment-action-buttons";
import { Shpitz } from "../shpitz/shpitz";
import "./segment-bubble.scss";

const OFFSET_V = -10;
const PER_LETTER_PIXELS = 8;

export interface SegmentBubbleProps {
  left: number;
  top: number;
  dimension?: Dimension;
  segmentLabel?: string;
  measureLabel?: string | JSX.Element;
  clicker?: Clicker;
  onClose?: Fn;
  openRawDataModal?: Fn;
}

function label(segmentLabel: string, measureLabel: string | JSX.Element) {
  const minTextWidth = clamp(segmentLabel.length * PER_LETTER_PIXELS, 80, 300);
  return <div className="text" style={{ minWidth: minTextWidth }}>
    <div className="segment">{segmentLabel}</div>
    {measureLabel ? <div className="measure-value">{measureLabel}</div> : null}
  </div>;
}

function actions({ clicker, dimension, segmentLabel, openRawDataModal, onClose }: SegmentBubbleProps) {
  return <SegmentActionButtons
    clicker={clicker}
    dimension={dimension}
    segmentLabel={segmentLabel}
    openRawDataModal={openRawDataModal}
    onClose={onClose}
  />;
}

export const SegmentBubble: React.SFC<SegmentBubbleProps> = (props: SegmentBubbleProps) => {
  const { left, top, segmentLabel, measureLabel, clicker  } = props;
  return <BodyPortal left={left} top={top + OFFSET_V} disablePointerEvents={!clicker}>
    <div className="segment-bubble">
      {segmentLabel && label(segmentLabel, measureLabel)}
      {clicker && actions(props)}
      <Shpitz direction="up"/>
    </div>
  </BodyPortal>;
};
