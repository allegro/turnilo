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
  highlightText: string;
}

export interface HighlightStringState {
}

export class HighlightString extends React.Component<HighlightStringProps, HighlightStringState> {
  constructor() {
    super();

  }

  highlightInString(): any {
    var { text, highlightText} = this.props;
    if (!highlightText) return text;
    var strLower = text.toLowerCase();
    var startIndex = strLower.indexOf(highlightText.toLowerCase());
    if (startIndex === -1) return text;
    var endIndex = startIndex + highlightText.length;
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
