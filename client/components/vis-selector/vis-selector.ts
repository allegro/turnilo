'use strict';

import * as React from 'react/addons';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Measure, Manifest } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface VisSelectorProps {
  clicker: Clicker;
  essence: Essence;
}

interface VisSelectorState {
  menuOpen: boolean;
}

export class VisSelector extends React.Component<VisSelectorProps, VisSelectorState> {

  constructor() {
    super();
    this.state = {
      menuOpen: false
    };

  }

  render() {
    var { clicker, essence } = this.props;
    var { visualizations, visualization, dataSource, splits } = essence;

    var visItems: Array<React.DOMElement<any>> = null;
    if (visualizations) {
      visItems = visualizations.toArray().map(v => {
        var state: string;

        if (v.id === visualization.id) {
          state = 'selected';
        } else {
          state = v.handleCircumstance(dataSource, splits).toString();
        }

        return JSX(`
          <div
            key={v}
            className={'vis-item ' + state}
            onClick={clicker.selectVisualization.bind(clicker, v)}
          >{v.title}</div>
        `);
      });
    }

    return JSX(`
      <div className="vis-selector">
        {visItems}
      </div>
    `);
  }
}
