'use strict';

import React = require('react/addons');
import { List } from 'immutable';
import { $, Expression, Dispatcher } from 'plywood';
import { isInside } from '../../utils/dom';
import { DataSource, SplitCombine, Filter, Dimension, Measure, Clicker } from "../../models/index";
import { MenuTable } from "../menu-table/menu-table";

interface FilterSplitMenuProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  dimension: Dimension;
  anchor: number;
  height: number;
  trigger: Element;
  onClose: () => void;
}

interface FilterSplitMenuState {
  filter?: Filter;
}

export class FilterSplitMenu extends React.Component<FilterSplitMenuProps, FilterSplitMenuState> {

  constructor() {
    super();
    this.state = {
      filter: null
    };
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

  componentWillReceiveProps(nextProps: FilterSplitMenuProps) {

  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, trigger } = this.props;
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, trigger)) return;
    onClose();
  }

  globalKeyDownListener(event: KeyboardEvent) {
    if (event.which !== 27) return; // 27 = escape
    this.props.onClose();
  }

  onOK() {
    var { clicker, onClose } = this.props;
    var { filter } = this.state;
    clicker.setFilter(filter);
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
    clicker.pinDimension(dimension);
    onClose();
  }

  addSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.addSplit(new SplitCombine($(dimension.name), null, null));
    onClose();
  }

  changeSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.changeSplits(List([new SplitCombine($(dimension.name), null, null)]));
    onClose();
  }

  render() {
    var { onClose, dataSource, filter, dimension, anchor } = this.props;

    var height = 400;
    var containerHeight = this.props.height;
    var top = Math.min(Math.max(0, anchor - height / 2), containerHeight - height);
    var style = {
      top: top + 'px',
      height: height + 'px'
    };
    var shpitzStyle = {
      top: anchor - top
    };

    return JSX(`
      <div className="filter-split-menu" style={style}>
        <div className="title-bar">
          <div className="title">{dimension.title}</div>
          <div className="pin" onClick={this.pinDimension.bind(this)}>p</div>
          <div className="close" onClick={onClose}>x</div>
        </div>
        <MenuTable
          dataSource={dataSource}
          filter={filter}
          dimension={dimension}
          selectFilter={this.selectFilter.bind(this)}
          showSearch={true}
          showCheckboxes={true}
        />
        <div className="button-bar">
          <div className="ok button" onClick={this.onOK.bind(this)}>OK</div>
          <div className="cancel button" onClick={onClose}>Cancel</div>
          <div className="add-split link" onClick={this.addSplit.bind(this)}>+</div>
          <div className="change-split link" onClick={this.changeSplit.bind(this)}>&rarr;</div>
        </div>
        <div className="shpitz" style={shpitzStyle}></div>
      </div>
    `);
  }
}
