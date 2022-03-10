/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { classNames } from "../../utils/dom/dom";
import "./highlight-string.scss";

export interface HighlightStringProps {
  className?: string;
  text: string;
  highlight: string | RegExp;
}

function highlightByIndex(text: string, start: number, end: number) {
  return [
    <span className="pre" key="pre">{text.substring(0, start)}</span>,
    <span className="bold" key="bold">{text.substring(start, end)}</span>,
    <span className="post" key="post">{text.substring(end)}</span>
  ];
}

function highlightBy(text: string, highlight: string | RegExp): string | JSX.Element[] {
  if (!highlight) return text;

  if (typeof highlight === "string") {
    const strLower = text.toLowerCase();
    const startIndex = strLower.indexOf(highlight.toLowerCase());
    if (startIndex === -1) return text;
    return highlightByIndex(text, startIndex, startIndex + highlight.length);
  }
  const match = text.match(highlight);
  if (!match) return text;
  const startIndex = match.index;
  return highlightByIndex(text, startIndex, startIndex + match[0].length);
}

export const HighlightString: React.FunctionComponent<HighlightStringProps> = ({ className, text, highlight }) => {
  return <span className={classNames("highlight-string", className)}>{highlightBy(text, highlight)}</span>;
};
