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
    // this.state = {};

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
