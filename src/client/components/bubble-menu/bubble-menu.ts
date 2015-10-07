'use strict';

import * as React from 'react/addons';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor } from 'plywood';
import { Stage } from '../../../common/models/index';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';

const OFFSET_H = 10;
const OFFSET_V = -1;

export interface BubbleMenuProps {
  className: string;
  direction: string;
  stage: Stage;
  containerStage: Stage;
  openOn: Element;
  onClose: Function;
  children: any;
}

export interface BubbleMenuState {
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
    var { openOn, direction } = this.props;
    var rect = openOn.getBoundingClientRect();
    switch (direction) {
      case 'right':
        this.setState({
          x: rect.left + rect.width - OFFSET_H,
          y: rect.top + rect.height / 2
        });
        break;

      case 'down':
        this.setState({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height - OFFSET_V
        });
        break;

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }
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
    // can not use React.findDOMNode(this) because portal?
    var myElement = <Element>document.getElementsByClassName('bubble-menu')[0];
    if (!myElement) return;
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  render(): any {
    var { className, direction, stage, containerStage, children } = this.props;
    var { x, y } = this.state;

    var menuWidth = stage.width;
    var menuHeight = stage.height;

    var menuStyle: any = {
      width: menuWidth,
      height: menuHeight
    };
    var shpitzStyle: any = {
      left: 0,
      top: 0
    };

    switch (direction) {
      case 'right':
        var top = Math.min(Math.max(containerStage.y, y - menuHeight / 2), containerStage.y + containerStage.height - menuHeight);
        menuStyle.left = x;
        menuStyle.top = top;
        shpitzStyle.top = y - top;
        break;

      case 'down':
        var left = Math.min(Math.max(containerStage.x, x - menuWidth / 2), containerStage.x + containerStage.width - menuWidth);
        menuStyle.left = left;
        menuStyle.top = y;
        shpitzStyle.left = x - left;
        break;

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }

    var myClass = 'bubble-menu ' + direction;
    if (className) myClass += ' ' + className;
    return JSX(`
      <BodyPortal>
        <div className={myClass} style={menuStyle}>
          {children}
          <div className="shpitz" style={shpitzStyle}></div>
        </div>
      </BodyPortal>
    `);
  }
}
