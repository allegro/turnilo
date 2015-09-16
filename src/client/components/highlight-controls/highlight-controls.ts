'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

function stopEvent(e: MouseEvent): void {
  e.stopPropagation();
}

interface HighlightControlsProps {
  clicker: Clicker;
  orientation: string;
  onClose?: Function;
  style?: any;
}

interface HighlightControlsState {
}

export class HighlightControls extends React.Component<HighlightControlsProps, HighlightControlsState> {

  constructor() {
    super();
    // this.state = {};

  }

  onAccept(e: MouseEvent) {
    e.stopPropagation();
    var { onClose, clicker } = this.props;
    clicker.acceptHighlight();
    if (onClose) onClose();
  }

  onCancel(e: MouseEvent) {
    e.stopPropagation();
    var { onClose, clicker } = this.props;
    clicker.dropHighlight();
    if (onClose) onClose();
  }

  render() {
    var { orientation, style } = this.props;

    var orientationClass = orientation === 'horizontal' ? 'horizontal' : 'vertical';
    return JSX(`
      <div className={'highlight-controls ' + orientationClass} onMouseDown={stopEvent} style={style}>
        <div className="button accept" onClick={this.onAccept.bind(this)} >
          <Icon name="check"/>
        </div>
        <div className="button cancel" onClick={this.onCancel.bind(this)}>
          <Icon name="x"/>
        </div>
      </div>
    `);
  }
}
