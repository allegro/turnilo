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
import parseMarkdown from "../../../common/utils/markdown/markdown";
import { classNames } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { Shpitz } from "../shpitz/shpitz";
import "./markdown-bubble.scss";

export enum Orientation { UNDER, OVER }

export interface MarkdownBubbleProps {
  x: number;
  y: number;
  orientation: Orientation;
  content: string;
}

export const MarkdownBubble: React.SFC<MarkdownBubbleProps> = ({ x, y, orientation, content }) => {
  const isUnder = orientation === Orientation.UNDER;
  return <BodyPortal left={x} bottom={!isUnder ? y : undefined} top={isUnder ? y : undefined}>
    <div className={classNames("markdown-bubble", { "markdown-bubble--reverse": !isUnder })}>
      <div className="markdown-content" dangerouslySetInnerHTML={parseMarkdown(content)}/>
      <Shpitz direction={isUnder ? "down" : "up"}/>
    </div>
  </BodyPortal>;
};
