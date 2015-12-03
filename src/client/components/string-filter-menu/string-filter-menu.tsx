'use strict';
require('./string-filter-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, Set } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, FilterClause, Dimension, Measure, Colors } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { MenuTable } from '../menu-table/menu-table';

export interface StringFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  insertPosition: number;
  replacePosition: number;
  onClose: Function;
}

export interface StringFilterMenuState {
  selectedValues?: Set;
  colors?: Colors;
}

export class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {

  constructor() {
    super();
    this.state = {
      selectedValues: null,
      colors: null
    };

  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter, colors } = essence;

    var myColors = (colors && colors.dimension === dimension.name ? colors : null);

    var valueSet = filter.getValues(dimension.expression);
    this.setState({
      selectedValues: valueSet || (myColors ? myColors.toSet() : Set.EMPTY),
      colors: myColors
    });
  }

  constructFilter(): Filter {
    var { essence, dimension, insertPosition, replacePosition } = this.props;
    var { selectedValues } = this.state;
    var { filter } = essence;

    if (selectedValues.size()) {
      var clause = new FilterClause({
        expression: dimension.expression,
        values: selectedValues
      });
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

  onValueClick(value: any) {
    var { selectedValues, colors } = this.state;
    selectedValues = selectedValues.toggle(value);
    if (colors) {
      colors = colors.toggle(value);
    }
    this.setState({
      selectedValues,
      colors
    });
  }

  onOkClick() {
    var { clicker, onClose } = this.props;
    var { colors } = this.state;
    clicker.changeFilter(this.constructFilter(), colors);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { essence, dimension } = this.props;
    var { selectedValues, colors } = this.state;
    if (!dimension) return null;

    var actionDisabled = essence.filter.equals(this.constructFilter());

    return <div className="string-filter-menu">
      <MenuTable
        essence={essence}
        dimension={dimension}
        selectedValues={selectedValues}
        colors={colors}
        onValueClick={this.onValueClick.bind(this)}
      />
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={actionDisabled}>OK</button>
        <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
      </div>
    </div>;
  }
}
