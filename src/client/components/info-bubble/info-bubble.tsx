/*
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

import React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { classNames } from "../../utils/dom/dom";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { MarkdownNode } from "../markdown-node/markdown-node";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./info-bubble.scss";

const defaultIcon = require("../../icons/info.svg");
const defaultTitle = "More info";

const BUBBLE_MAX_VERTICAL_SPACE = 120;

export interface InfoBubbleState {
  showInfo: { target: Element, direction: Direction };
}

export interface InfoBubbleProps {
  description: string;
  extendedDescription?: string;
  icon?: string;
  title?: string;
  className?: string;
}

export class InfoBubble extends React.Component<InfoBubbleProps, InfoBubbleState> {

  showDescription = ({ currentTarget }: React.MouseEvent<HTMLElement>) => {
    const willBubbleFit = currentTarget.getBoundingClientRect().top > BUBBLE_MAX_VERTICAL_SPACE;
    const direction = willBubbleFit ? "up" : "down";
    this.setState({ showInfo: { target: currentTarget, direction } });
  };

  closeDescription = () => {
    this.setState({ showInfo: null });
  };

  constructor(props: InfoBubbleProps) {
    super(props);
    this.state = { showInfo: null };
  }

  render() {
    const { showInfo } = this.state;
    const { description, extendedDescription, icon, className, title } = this.props;
    const fullDescription = extendedDescription ? `${description}\n\n${extendedDescription}` : description;

    return <React.Fragment>
      <div className={classNames("info-button", className)} title={title || defaultTitle} onClick={this.showDescription}>
        <SvgIcon svg={icon || defaultIcon} />
      </div>
      {showInfo && <BubbleMenu
        className="description-menu"
        direction={showInfo.direction}
        onClose={this.closeDescription}
        stage={Stage.fromSize(300, 200)}
        openOn={showInfo.target}>
        <MarkdownNode markdown={fullDescription} />
      </BubbleMenu>}
    </React.Fragment>;
  }
}
