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

import * as React from "react";
import { MarkdownBubble, Orientation } from "../markdown-bubble/markdown-bubble";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./info-bubble.scss";

const BUBBLE_OFFSET_TOP = 15;
const BUBBLE_OFFSET_LEFT = 10;
const BUBBLE_MAX_VERTICAL_SPACE = 120;

export interface Coordinates {
  y: number;
  x: number;
  orientation: Orientation;
}

export interface InfoBubbleState {
  showInfo: Coordinates;
}

export interface InfoBubbleProps {
  description: string;
}

function calculateCoordinates({ top, bottom, left }: ClientRect | DOMRect): Coordinates {
  const willBubbleFit = top > BUBBLE_MAX_VERTICAL_SPACE;

  const y = willBubbleFit ? window.innerHeight - top : bottom;
  const orientation = willBubbleFit ? Orientation.OVER : Orientation.UNDER;

  return {
    y: y + BUBBLE_OFFSET_TOP,
    orientation,
    x: left + BUBBLE_OFFSET_LEFT
  };
}

export class InfoBubble extends React.Component<InfoBubbleProps, InfoBubbleState> {

  showDescription = (e: React.MouseEvent<HTMLElement>) => {
    const showInfo = calculateCoordinates((e.target as HTMLElement).getBoundingClientRect());
    this.setState({ showInfo });
    document.addEventListener("mousedown", this.closeDescription);
    e.stopPropagation();
  }

  closeDescription = () => {
    document.removeEventListener("mousedown", this.closeDescription);
    this.setState({ showInfo: null });
  }

  constructor(props: InfoBubbleProps) {
    super(props);
    this.state = { showInfo: null };
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.closeDescription);
  }

  render() {
    const { showInfo } = this.state;
    return <React.Fragment>
      <div className="info-button" onClick={this.showDescription}>
        <SvgIcon svg={require("../../icons/help.svg")}/>
      </div>
      {showInfo && <MarkdownBubble
        y={showInfo.y}
        x={showInfo.x}
        orientation={showInfo.orientation}
        content={this.props.description}/>}
    </React.Fragment>;
  }

}
