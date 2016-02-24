require('./highlight-controls.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

function stopEvent(e: React.MouseEvent): void {
  e.stopPropagation();
}

export interface HighlightControlsProps extends React.Props<any> {
  clicker: Clicker;
  orientation: string;
  onClose?: Function;
  style?: any;
}

export interface HighlightControlsState {
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
    return <div className={'highlight-controls ' + orientationClass} onMouseDown={stopEvent} style={style}>
      <div className="button accept" onClick={this.onAccept.bind(this)}>
        <SvgIcon svg={require('../../icons/check.svg')}/>
      </div>
      <div className="button cancel" onClick={this.onCancel.bind(this)}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    </div>;
  }
}
