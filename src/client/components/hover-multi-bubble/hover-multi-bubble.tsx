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
import { BodyPortal } from "../body-portal/body-portal";
import { SegmentActionButtons } from "../segment-action-buttons/segment-action-buttons";
import "./hover-multi-bubble.scss";

const LEFT_OFFSET = 22;

export interface ColorEntry {
  color: string;
  segmentLabel: string;
  measureLabel: string | JSX.Element;
}

export interface HoverMultiBubbleProps {
  left: number;
  top: number;
  dimension?: Dimension;
  segmentLabel?: string;
  colorEntries?: ColorEntry[];
  clicker?: Clicker;
  onClose?: Fn;
}

function renderColorSwabs(colorEntries: ColorEntry[]): JSX.Element {
  if (!colorEntries || !colorEntries.length) return null;

  const colorSwabs = colorEntries.map((colorEntry: ColorEntry) => {
    const { color, segmentLabel, measureLabel } = colorEntry;
    const swabStyle = { background: color };
    return <div className="color" key={segmentLabel}>
      <div className="color-swab" style={swabStyle}/>
      <div className="color-name">{segmentLabel}</div>
      <div className="color-value">{measureLabel}</div>
    </div>;
  });

  return <div className="colors">{colorSwabs}</div>;
}

export const HoverMultiBubble: React.SFC<HoverMultiBubbleProps> = ({ colorEntries, left, top, dimension, segmentLabel, clicker, onClose }) => {
  return <BodyPortal left={left + LEFT_OFFSET} top={top} disablePointerEvents={!clicker}>
    <div className="hover-multi-bubble">
      <div className="bucket">{segmentLabel}</div>
      {renderColorSwabs(colorEntries)}
      {clicker && <SegmentActionButtons
        clicker={clicker}
        dimension={dimension}
        segmentLabel={segmentLabel}
        disableMoreMenu={true}
        onClose={onClose}/>}
    </div>
  </BodyPortal>;
};
