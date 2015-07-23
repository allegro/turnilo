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
    this.selectFilter = this.selectFilter.bind(this);
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps: FilterSplitMenuProps) {

  }

  componentWillUnmount() {

  }

  onOK() {
    var { clicker, onClose } = this.props;
    var { filter } = this.state;
    clicker.setFilter(filter);
    onClose();
  }

  selectFilter(newFilter: Filter, done: boolean = false): void {
    var { clicker, onClose } = this.props;
    if (done) {
      clicker.setFilter(newFilter);
      onClose();
    } else {
      this.setState({
        filter: newFilter
      });
    }
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
