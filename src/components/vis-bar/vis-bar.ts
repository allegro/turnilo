'use strict';

import * as React from 'react/addons';
import { List } from 'immutable';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { Clicker, Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

function toTitle(str: string) {
  return str.replace('-vis', '').replace(/-/g, ' ');
}

interface VisBarProps {
  clicker: Clicker;
  visualizations: List<string>;
  visualization: string;
}

interface VisBarState {
}

export class VisBar extends React.Component<VisBarProps, VisBarState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps: VisBarProps) {

  }

  componentWillUnmount() {

  }

  render() {
    var { clicker, visualizations, visualization } = this.props;

    var visItems: Array<React.DOMElement<any>> = null;
    if (visualizations) {
      visItems = visualizations.toArray().map(v => {
        return JSX(`
          <div
            key={v}
            className={'vis-item' + (v === visualization ? ' selected' : '')}
            onClick={clicker.selectVisualization.bind(clicker, v)}
          >{toTitle(v)}</div>
        `);
      });
    }

    return JSX(`
      <div className="vis-bar">
        {visItems}
      </div>
    `);
  }
}
