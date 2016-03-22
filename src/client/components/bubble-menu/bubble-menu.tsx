require('./bubble-menu.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor } from 'plywood';
import { Stage } from '../../../common/models/index';
import { isInside, escapeKey, uniqueId } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';

const OFFSET_H = 10;
const OFFSET_V = -1;
const SCREEN_OFFSET = 5;

export type BubbleLayout = 'normal' | 'mini';

export interface BubbleMenuProps extends React.Props<any> {
  className: string;
  id?: string;
  direction: string;
  stage: Stage;
  fixedSize?: boolean;
  containerStage?: Stage;
  openOn: Element;
  onClose: Function;
  inside?: Element;
  layout?: BubbleLayout;
}

export interface BubbleMenuState {
  id?: string;
  x?: number;
  y?: number;
}

export class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {

  constructor() {
    super();
    this.state = {
      id: null
    };
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { openOn, direction, id } = this.props;
    var rect = openOn.getBoundingClientRect();

    var x: number;
    var y: number;
    switch (direction) {
      case 'right':
        x = rect.left + rect.width - OFFSET_H;
        y = rect.top + rect.height / 2;
        break;

      case 'down':
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height - OFFSET_V;
        break;

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }

    this.setState({
      id: id || uniqueId('bubble-menu-'),
      x,
      y
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
    var { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    var myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  render(): any {
    var { className, direction, stage, fixedSize, containerStage, inside, layout, children } = this.props;
    var { id, x, y } = this.state;

    var menuWidth = stage.width;
    var menuHeight = stage.height;

    var menuLeft = 0;
    var menuTop = 0;
    var menuStyle: any = {};
    if (fixedSize) {
      menuStyle.width = menuWidth;
      menuStyle.height = menuHeight;
    }
    var shpitzStyle: any = {
      left: 0,
      top: 0
    };

    if (!containerStage) {
      containerStage = new Stage({
        x: SCREEN_OFFSET,
        y: SCREEN_OFFSET,
        width: window.innerWidth - SCREEN_OFFSET * 2,
        height: window.innerHeight - SCREEN_OFFSET * 2
      });
    }

    switch (direction) {
      case 'right':
        var top = y - menuHeight / 2;
        // constrain
        top = Math.min(Math.max(top, containerStage.y), containerStage.y + containerStage.height - menuHeight);
        menuLeft = x;
        menuTop = top;
        shpitzStyle.top = y - top;
        menuStyle.height = menuHeight;
        break;

      case 'down':
        var left = x - menuWidth / 2;
        // constrain
        left = Math.min(Math.max(left, containerStage.x), containerStage.x + containerStage.width - menuWidth);
        menuLeft = left;
        menuTop = y;
        shpitzStyle.left = x - left;
        menuStyle.width = menuWidth;
        break;

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }

    var insideId: string = null;
    if (inside) {
      insideId = inside.id;
      if (!insideId) throw new Error('inside element must have id');
    }

    var myClasses = ['bubble-menu', direction];
    if (className) myClasses.push(className);
    if (layout === 'mini') myClasses.push('mini');
    return <BodyPortal left={menuLeft} top={menuTop}>
      <div className={myClasses.join(' ')} id={id} data-parent={insideId} style={menuStyle}>
        {children}
        <div className="shpitz" style={shpitzStyle}></div>
      </div>
    </BodyPortal>;
  }
}
