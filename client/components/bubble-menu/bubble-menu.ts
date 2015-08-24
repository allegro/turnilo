'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor } from 'plywood';
import { isInside, escapeKey } from '../../utils/dom';
import { Stage } from '../../models/index';
import { MenuPortal } from '../menu-portal/menu-portal';

interface BubbleMenuProps {
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
    var { onClose, containerStage, children } = this.props;
    var { x, y } = this.state;

    var menuWidth: number;
    var menuHeight: number;

    menuWidth = 250;
    menuHeight = 400;

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
      <MenuPortal>
        <div className="bubble-menu" style={style}>
          {children}
          <div className="shpitz" style={shpitzStyle}></div>
        </div>
      </MenuPortal>
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

{dimension.type === 'TIME' ? this.renderTimeSeries() : this.renderTable()}
<div className="button-bar">
  <div className="ok button" onClick={this.onOK.bind(this)}>OK</div>
  <div className="cancel button" onClick={onClose}>Cancel</div>
</div>
 */
