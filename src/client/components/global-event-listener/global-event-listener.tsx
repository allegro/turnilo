import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { firstUp } from '../../../common/utils/string/string';
import { escapeKey, enterKey, leftKey, rightKey } from '../../utils/dom/dom';


export interface GlobalEventListenerProps extends React.Props<any> {
  resize?: () => void;
  scroll?: () => void;
  mouseDown?: (e: MouseEvent) => void;
  mouseMove?: (e: MouseEvent) => void;
  mouseUp?: (e: MouseEvent) => void;
  keyDown?: (e: KeyboardEvent) => void;
  enter?: (e: KeyboardEvent) => void;
  escape?: (e: KeyboardEvent) => void;
  right?: (e: KeyboardEvent) => void;
  left?: (e: KeyboardEvent) => void;
}

export interface GlobalEventListenerState {
}

export class GlobalEventListener extends React.Component<GlobalEventListenerProps, GlobalEventListenerState> {
  public mounted: boolean;
  private propsToEvents: any = {
    resize: 'resize',
    scroll: 'scroll',
    mouseDown: 'mousedown',
    mouseMove: 'mousemove',
    mouseUp: 'mouseup',
    keyDown: 'keydown',
    enter: 'keydown',
    escape: 'keydown',
    right: 'keydown',
    left: 'keydown'
  };

  constructor() {
    super();

    this.onResize = this.onResize.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.onMousedown = this.onMousedown.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentWillReceiveProps(nextProps: GlobalEventListenerProps) {
    this.refreshListeners(nextProps, this.props);
  }

  componentDidMount() {
    this.refreshListeners(this.props);
  }

  componentWillUnmount() {
    for (let prop in this.propsToEvents) {
      this.removeListener(this.propsToEvents[prop]);
    }
  }

  refreshListeners(nextProps: any, currentProps: any = {}) {
    var toAdd: string[] = [];
    var toRemove: string[] = [];

    for (let prop in this.propsToEvents) {
      let event = this.propsToEvents[prop];

      if (currentProps[prop] && nextProps[prop]) continue;

      if (nextProps[prop] && toAdd.indexOf(event) === -1) {
        toAdd.push(event);
      } else if (currentProps[prop] && toRemove.indexOf(event) === -1) {
        toRemove.push(event);
      }
    }

    toRemove.forEach(this.removeListener, this);
    toAdd.forEach(this.addListener, this);
  }

  addListener(event: string) {
    var useCapture = event === 'scroll';
    window.addEventListener(event, (this as any)[`on${firstUp(event)}`], useCapture);
  }

  removeListener(event: string) {
    window.removeEventListener(event, (this as any)[`on${firstUp(event)}`]);
  }

  onResize() {
    if (this.props.resize) this.props.resize();
  }

  onScroll() {
    if (this.props.scroll) this.props.scroll();
  }

  onMousedown(e: MouseEvent) {
    if (this.props.mouseDown) this.props.mouseDown(e);
  }

  onMousemove(e: MouseEvent) {
    if (this.props.mouseMove) this.props.mouseMove(e);
  }

  onMouseup(e: MouseEvent) {
    if (this.props.mouseUp) this.props.mouseUp(e);
  }

  onKeydown(e: KeyboardEvent) {
    if (this.props.escape && escapeKey(e)) this.props.escape(e);
    if (this.props.enter && enterKey(e)) this.props.enter(e);
    if (this.props.right && rightKey(e)) this.props.right(e);
    if (this.props.left && leftKey(e)) this.props.left(e);

    if (this.props.keyDown) this.props.keyDown(e);
  }

  render(): JSX.Element {
    return null;
  }
}
