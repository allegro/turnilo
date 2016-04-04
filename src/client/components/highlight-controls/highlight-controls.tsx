require('./highlight-controls.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { Stage, Clicker } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';

function stopEvent(e: React.MouseEvent): void {
  e.stopPropagation();
}

export interface HighlightControlsProps extends React.Props<any> {
  clicker: Clicker;
  orientation: string;
  onClose?: Fn;
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

    return <div
      className={classNames('highlight-controls', orientation === 'horizontal' ? 'horizontal' : 'vertical')}
      onMouseDown={stopEvent}
      style={style}
    >
      <div className="button accept" onClick={this.onAccept.bind(this)}>
        <SvgIcon svg={require('../../icons/check.svg')}/>
      </div>
      <div className="button cancel" onClick={this.onCancel.bind(this)}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    </div>;
  }
}
