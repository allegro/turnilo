'use strict';
require('./modal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { isInside, escapeKey, uniqueId } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';

const TOP_RATIO = 0.618 / 1.618;

export interface ModalProps extends React.Props<any> {
  className?: string;
  id?: string;
  title?: string;
  mandatory?: boolean;
  onClose: Function;
}

export interface ModalState {
  id?: string;
  windowTop?: number;
}

export class Modal extends React.Component<ModalProps, ModalState> {

  constructor() {
    super();
    this.state = {
      id: null,
      windowTop: 0
    };
    this.globalResizeListener = this.globalResizeListener.bind(this);
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { id } = this.props;

    this.setState({
      id: id || uniqueId('modal-')
    });
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, mandatory } = this.props;
    if (mandatory) return;

    var { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    var myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose, mandatory } = this.props;
    if (mandatory) return;
    onClose();
  }

  globalResizeListener() {
    var modalRect = ReactDOM.findDOMNode(this.refs['modal']).getBoundingClientRect();
    var windowRect = ReactDOM.findDOMNode(this.refs['window']).getBoundingClientRect();

    var windowTop = (modalRect.height - windowRect.height) * TOP_RATIO;
    this.setState({ windowTop });
  }

  render() {
    var { className, title, children } = this.props;
    var { id, windowTop } = this.state;

    var titleElement: JSX.Element = null;
    if (typeof title === 'string') {
      titleElement = <div className="modal-title">
        {title}
      </div>;
    }

    var myClass = 'modal';
    if (className) myClass += ' ' + className;

    return <BodyPortal fullSize={true}>
      <div className={myClass} ref="modal">
        <div className="backdrop"></div>
        <div className="modal-window" id={id} ref="window" style={{ top: windowTop }}>
          {titleElement}
          {children}
        </div>
      </div>
    </BodyPortal>;
  }
}
