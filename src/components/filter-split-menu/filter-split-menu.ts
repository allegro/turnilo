'use strict';

import React = require('react');
import { $, Expression, Dispatcher } from 'plywood';
import { Filter, Dimension, Measure, Clicker } from "../../models/index";
import { MenuTable } from "../menu-table/menu-table";

interface FilterSplitMenuProps {
  clicker: Clicker;
  dispatcher: Dispatcher;
  filter: Filter;
  dimension: Dimension;
  anchor: number;
  height: number;
  triger: Element;
  onClose: () => void;
}

interface FilterSplitMenuState {
  filter?: Filter;
}

function isInside(child: Element, parent: Element): boolean {
  while (child) {
    if (child === parent) return true;
    child = child.parentElement;
  }
  return false;
}

export class FilterSplitMenu extends React.Component<FilterSplitMenuProps, FilterSplitMenuState> {

  constructor() {
    super();
    this.state = {
      filter: null
    };
    this.selectFilter = this.selectFilter.bind(this);
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
  }

  componentWillReceiveProps(nextProps: FilterSplitMenuProps) {

  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, triger } = this.props;
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, triger)) return;
    onClose();
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

  render() {
    var { onClose, dispatcher, filter, dimension, anchor } = this.props;

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
          <div className="close" onClick={onClose}>x</div>
        </div>
        <div className="cont">
          <MenuTable dispatcher={dispatcher} filter={filter} dimension={dimension} selectFilter={this.selectFilter}/>
        </div>
        <div className="button-bar">
          <div className="ok button" onClick={this.onOK.bind(this)}>OK</div>
          <div className="cancel button" onClick={onClose}>Cancel</div>
        </div>
        <div className="shpitz" style={shpitzStyle}></div>
      </div>
    `);
  }
}
