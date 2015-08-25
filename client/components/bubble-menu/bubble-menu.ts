'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor } from 'plywood';
import { isInside, escapeKey } from '../../utils/dom';
import { Stage } from '../../models/index';
import { BodyPortal } from '../body-portal/body-portal';

interface BubbleMenuProps {
  stage: Stage;
  containerStage: Stage;
  openOn: Element;
  onClose: Function;
  children: any;
}

interface BubbleMenuState {
  x: number;
  y: number;
}

export class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {

  constructor() {
    super();
    //this.state = {};
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var rect = this.props.openOn.getBoundingClientRect();
    this.setState({
      x: rect.left + rect.width - 10,
      y: rect.top + rect.height / 2
    });
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, openOn } = this.props;
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { stage, containerStage, children } = this.props;
    var { x, y } = this.state;

    var menuWidth = stage.width;
    var menuHeight = stage.height;

    var top = Math.min(Math.max(containerStage.y, y - menuHeight / 2), containerStage.y + containerStage.height - menuHeight);
    var style = {
      left: x,
      top: top,
      width: menuWidth,
      height: menuHeight
    };
    var shpitzStyle = {
      top: y - top
    };

    return JSX(`
      <BodyPortal>
        <div className="bubble-menu" style={style}>
          {children}
          <div className="shpitz" style={shpitzStyle}></div>
        </div>
      </BodyPortal>
    `);
  }
}
