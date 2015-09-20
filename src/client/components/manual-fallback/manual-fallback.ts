'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, Resolution } from '../../../common/models/index';


interface ManualFallbackProps {
  clicker: Clicker;
  essence: Essence;
}

interface ManualFallbackState {
}

export class ManualFallback extends React.Component<ManualFallbackProps, ManualFallbackState> {

  constructor() {
    super();
    // this.state = {};

  }

  onResolutionClick(resolution: Resolution): void {
    var { clicker } = this.props;
    clicker.changeSplits(resolution.adjustment(), true);
  }

  render() {
    var { essence } = this.props;
    var { visResolve } = essence;

    if (!visResolve.isManual()) return null;

    var resolutionItems = visResolve.resolutions.map((resolution, i) => {
      return JSX(`
        <li key={i} onClick={this.onResolutionClick.bind(this, resolution)}>{resolution.description}</li>
      `);
    });

    return JSX(`
      <div className="manual-fallback">
        <div className="message">{visResolve.message}</div>
        <ul>{resolutionItems}</ul>
      </div>
    `);
  }
}
