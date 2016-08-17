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

require('./highlight-string.css');

import * as React from 'react';
import { classNames } from '../../utils/dom/dom';

export interface HighlightStringProps extends React.Props<any> {
  className?: string;
  text: string;
  highlight: string | RegExp;
}

export interface HighlightStringState {
}

export class HighlightString extends React.Component<HighlightStringProps, HighlightStringState> {
  constructor() {
    super();

  }

  highlightInString(): any {
    var { text, highlight} = this.props;
    if (!highlight) return text;

    let startIndex: number = null;
    let highlightString: string = null;
    if (typeof highlight === "string") {
      var strLower = text.toLowerCase();
      startIndex = strLower.indexOf(highlight.toLowerCase());
      if (startIndex === -1) return text;
      highlightString = highlight.toLowerCase();
    } else {
      var match = text.match(highlight);
      if (!match) return text;
      highlightString = match[0];
      startIndex = match.index;
    }
    var endIndex = startIndex + highlightString.length;

    return [
      <span className="pre" key="pre">{text.substring(0, startIndex)}</span>,
      <span className="bold" key="bold">{text.substring(startIndex, endIndex)}</span>,
      <span className="post" key="post">{text.substring(endIndex)}</span>
    ];
  }

  render() {
    var { className } = this.props;

    return <span className={classNames('highlight-string', className)}>{this.highlightInString()}</span>;
  }
}
