'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor } from 'plywood';
import { isInside } from '../../utils/dom';
import { Stage } from "../../models/index";

const TITLE_BAR_HEIGHT = 40;
const BUTTON_BAR_HEIGHT = 52;

interface BubbleMenuProps {
  anchor: number;
  parentStage: Stage;
  trigger: Element;
  onClose: Function;
  children: any;
}

interface BubbleMenuState {
}

export class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {

  constructor() {
    super();
    //this.state = {};
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
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
    var { onClose, trigger } = this.props;
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, trigger)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (e.which !== 27) return; // 27 = escape
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { onClose, anchor, parentStage, children } = this.props;

    var menuWidth: number;
    var menuHeight: number;

    menuWidth = 250;
    menuHeight = 400;

    var top = Math.min(Math.max(0, anchor - menuHeight / 2), parentStage.height - menuHeight);
    var style = {
      top,
      width: menuWidth,
      height: menuHeight
    };
    var shpitzStyle = {
      top: anchor - top
    };

    return JSX(`
      <div className="bubble-menu" style={style}>
        {children}
        <div className="shpitz" style={shpitzStyle}></div>
      </div>
    `);
  }
}

/*

 import { MenuTable } from "../menu-table/menu-table";
 import { MenuTimeSeries } from "../menu-time-series/menu-time-series";


  onOK() {
    var { clicker, onClose } = this.props;
    var { filter } = this.state;
    clicker.changeFilter(filter);
    onClose();
  }

  selectFilter(newFilter: Filter, source: string): void {
    var { clicker, onClose } = this.props;
    this.setState({
      filter: newFilter
    });
  }

  pinDimension(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.pin(dimension);
    onClose();
  }

  addSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.addSplit(dimension.getSplitCombine());
    onClose();
  }

  changeSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.changeSplits(List([dimension.getSplitCombine()]));
    onClose();
  }

  renderTable(): React.ReactElement<any> {
    var { dataSource, filter, dimension } = this.props;
    return JSX(`
      <MenuTable
        dataSource={dataSource}
        filter={filter}
        dimension={dimension}
        selectFilter={this.selectFilter.bind(this)}
        showSearch={true}
        showCheckboxes={true}
      />
    `);
  }

  renderTimeSeries(): React.ReactElement<any> {
    var { dataSource, filter, dimension } = this.props;
    return JSX(`
      <MenuTimeSeries
        stage={Stage.fromSize(400, 100)}
        dataSource={dataSource}
        filter={filter}
        dimension={dimension}
      />
    `);
  }

<div className="title-bar">
  <div className="title">{dimension.title}</div>
  <div className="pin" onClick={this.pinDimension.bind(this)}>
    <Icon name="pinned" height={12}/>
  </div>
  <div className="close" onClick={onClose}>
    <Icon name="x" height={12}/>
  </div>
</div>
{dimension.type === 'TIME' ? this.renderTimeSeries() : this.renderTable()}
<div className="button-bar">
  <div className="ok button" onClick={this.onOK.bind(this)}>OK</div>
  <div className="cancel button" onClick={onClose}>Cancel</div>
</div>
 */
