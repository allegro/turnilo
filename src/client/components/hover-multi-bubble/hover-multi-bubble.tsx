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
import { Clicker } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { BodyPortal } from "../body-portal/body-portal";
import { SegmentActionButtons } from "../segment-action-buttons/segment-action-buttons";
import "./hover-multi-bubble.scss";

const LEFT_OFFSET = 22;

export interface ColorEntry {
  color: string;
  name: string;
  value: string;
  previous?: string;
  delta?: JSX.Element;
}

export interface HoverMultiBubbleProps {
  left: number;
  top: number;
  title?: string;
  colorEntries?: ColorEntry[];
  clicker?: Clicker;
  onClose?: Fn;
}

function renderColorSwabs(colorEntries: ColorEntry[]): JSX.Element {
  if (!colorEntries || !colorEntries.length) return null;

  const colorSwabs = colorEntries.map(({ color, name, value, previous, delta }: ColorEntry) => {
    const swabStyle = { background: color };
    return <tr key={name}>
      <td>
        <div className="color-swab" style={swabStyle}/>
      </td>
      <td className="color-name">{name}</td>
      <td className="color-value">{value}</td>
      {previous && <td className="color-previous">{previous}</td>}
      {delta && <td className="color-delta">{delta}</td>}
    </tr>;
  });

  return <table className="colors">{colorSwabs}</table>;
}

export const HoverMultiBubble: React.SFC<HoverMultiBubbleProps> = ({ colorEntries, left, top, title, clicker, onClose }) => {
  return <BodyPortal left={left + LEFT_OFFSET} top={top} disablePointerEvents={!clicker}>
    <div className="hover-multi-bubble">
      <div className="bucket">{title}</div>
      {renderColorSwabs(colorEntries)}
      {clicker && <SegmentActionButtons
        clicker={clicker}
        segmentLabel={title}
        disableMoreMenu={true}
        onClose={onClose}/>}
    </div>
  </BodyPortal>;
};
