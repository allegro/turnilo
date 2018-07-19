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
import { BodyPortal } from "../body-portal/body-portal";
import { Shpitz } from "../shpitz/shpitz";
import "./markdown-bubble.scss";

export interface MarkdownBubbleProps {
  content: string;
  bottom: number;
  top: number;
  left: number;
}

export const MarkdownBubble: React.SFC<MarkdownBubbleProps> = ({ left, top, bottom, content }) =>
  <BodyPortal left={left} bottom={bottom} top={top}>
    <div className="markdown-bubble">
      <div className="markdown-content" dangerouslySetInnerHTML={parseMarkdown(content)}/>
      <Shpitz direction="up"/>
    </div>
  </BodyPortal>;
