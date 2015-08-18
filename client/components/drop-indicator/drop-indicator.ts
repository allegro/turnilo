'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface DropIndicatorProps {
}

interface DropIndicatorState {
}

export class DropIndicator extends React.Component<DropIndicatorProps, DropIndicatorState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps: DropIndicatorProps) {

  }

  componentWillUnmount() {

  }

  render() {
    return JSX(`
      <div className="drop-indicator">
        <div className="white-out"></div>
        <div className="actions">
          <div className="replace-split action">
            <div className="icon">
              <Icon name="split-replace" height={29}/>
            </div>
            <div className="label">
              Full view
            </div>
          </div>
          <div className="add-split action">
            <div className="icon">
              <Icon name="split-add" height={17}/>
            </div>
            <div className="label">
              Add split
            </div>
          </div>
        </div>
      </div>
    `);
  }
}
