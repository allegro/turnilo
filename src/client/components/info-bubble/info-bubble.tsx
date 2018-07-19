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
import { MarkdownBubble } from "../markdown-bubble/markdown-bubble";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./info-bubble.scss";

const BUBBLE_OFFSET = { top: 15, left: 10 };

export interface ShowInfoEvent {
  bottom?: number;
  top?: number;
  left?: number;
}

export interface InfoBubbleState {
  showInfo: ShowInfoEvent;
}

export interface InfoBubbleProps {
  description: string;
}

export class InfoBubble extends React.Component<InfoBubbleProps, InfoBubbleState> {

  showDescription = (e: React.MouseEvent<HTMLElement>) => {
    const { top, left } = (e.target as HTMLElement).getBoundingClientRect();
    // TODO: check if bubble fits over icon
    const showInfo: ShowInfoEvent = {
      bottom: window.innerHeight - top + BUBBLE_OFFSET.top,
      left: left + BUBBLE_OFFSET.left
    };
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
        top={showInfo.top}
        bottom={showInfo.bottom}
        left={showInfo.left}
        content={this.props.description}/>}
    </React.Fragment>;
  }

}
