'use strict';
require('./string-filter-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { MenuTable } from '../menu-table/menu-table';

export interface StringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  insertPosition: number;
  replacePosition: number;
  onClose: Function;
}

export interface StringFilterMenuState {
  selectedValues?: List<any>;
  showSearch?: boolean;
}

export class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {

  constructor() {
    super();
    this.state = {
      selectedValues: null,
      showSearch: false
    };

  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter } = essence;

    var valueSet = filter.getValues(dimension.expression);
    this.setState({
      selectedValues: List(valueSet ? valueSet.elements : [])
    });
  }

  constructFilter(): Filter {
    var { essence, dimension, insertPosition, replacePosition } = this.props;
    var { selectedValues } = this.state;
    var { filter } = essence;

    if (selectedValues.size) {
      var clause = dimension.expression.in(selectedValues.toArray());
      if (insertPosition !== null) {
        return filter.insertByIndex(insertPosition, clause);
      } else if (replacePosition !== null) {
        return filter.replaceByIndex(replacePosition, clause);
      } else {
        return filter.setClause(clause);
      }
    } else {
      return filter.remove(dimension.expression);
    }
  }

  onSearchClick() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  onValueClick(value: any) {
    var { selectedValues } = this.state;
    if (selectedValues.includes(value)) {
      selectedValues = <List<any>>selectedValues.filter(sv => sv !== value);
    } else {
      selectedValues = selectedValues.push(value);
    }
    this.setState({ selectedValues });
  }

  onOkClick() {
    var { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { essence, dimension } = this.props;
    var { selectedValues, showSearch } = this.state;
    if (!dimension) return null;

    var actionDisabled = essence.filter.equals(this.constructFilter());

    return JSX(`
      <div className="string-filter-menu">
        <MenuTable
          essence={essence}
          dimension={dimension}
          showSearch={showSearch}
          showCheckboxes={true}
          selectedValues={selectedValues}
          onValueClick={this.onValueClick.bind(this)}
        />
        <div className="button-bar">
          <button className="ok" onClick={this.onOkClick.bind(this)} disabled={actionDisabled}>OK</button>
          <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
        </div>
      </div>
    `);
  }
}
