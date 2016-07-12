/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./simple-table.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';

import { classNames } from '../../utils/dom/dom';

import { SvgIcon } from '../svg-icon/svg-icon';
import { Scroller } from '../scroller/scroller';

export interface SimpleTableColumn {
  label: string;
  field: string | ((row: any) => any);
  width: number;
  cellIcon?: string;
}

export interface SimpleTableAction {
  icon: string;
  callback: (item: any) => void;
  inEllipsis?: boolean;
}

export interface SimpleTableProps extends React.Props<any> {
  columns: SimpleTableColumn[];
  rows: any[];
  actions?: SimpleTableAction[];
  onRowClick?: (row: any) => void;
}

export interface SimpleTableState {
  sortColumn?: SimpleTableColumn;
  sortAscending?: boolean;
}

const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 26;
const ACTION_WIDTH = 30;

export class SimpleTable extends React.Component<SimpleTableProps, SimpleTableState> {
  constructor() {
    super();

    this.state = {};
  }

  renderHeaders(columns: SimpleTableColumn[], sortColumn: SimpleTableColumn, sortAscending: boolean): JSX.Element {
    var items: JSX.Element[] = [];

    for (let i = 0; i < columns.length; i++) {
      let column = columns[i];

      let icon: JSX.Element = null;
      if (sortColumn && sortColumn === column) {
        icon = <SvgIcon
          svg={require('../../icons/sort-arrow.svg')}
          className={`sort-arrow ${sortAscending ? 'ascending' : 'descending'}`}
        />;
      }

      items.push(<div
        className="header"
        style={{width: column.width}}
        key={`column-${i}`}
      >{column.label}{icon}</div>);
    }

    return <div className="column-headers">
      {items}
    </div>;
  }

  getIcons(row: any, actions: SimpleTableAction[]): JSX.Element[] {
    if (!actions || !actions.length) return null;

    var items: JSX.Element[] = [];

    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];

      items.push(<div
        className='cell action'
        key={`action-${i}`}
        onClick={action.callback.bind(this, row)}
      ><SvgIcon className="icon" svg={require(`../../icons/${action.icon}.svg`)}/></div>);
    }

    return items;
  }

  labelizer(column: SimpleTableColumn): (row: any) => any {
    if (typeof column.field === 'string') {
      return (row: any) => row[column.field as string];
    }

    return column.field as (row: any) => any;
  }

  renderRow(row: any, columns: SimpleTableColumn[], index: number): JSX.Element {
    var items: JSX.Element[] = [];

    for (let i = 0; i < columns.length; i++) {
      let col = columns[i];

      let icon = col.cellIcon ? <SvgIcon className="icon" svg={require(`../../icons/${col.cellIcon}.svg`)}/> : null;

      items.push(<div
        className={classNames('cell', {'has-icon': !!col.cellIcon})}
        style={{width: col.width}}
        key={`cell-${i}`}
      >{icon}{this.labelizer(col)(row)}</div>);
    }

    return <div className="row" key={`row-${index}`} style={{height: ROW_HEIGHT}}>
      {items}
    </div>;
  }

  sortRows(rows: any[], sortColumn: SimpleTableColumn, sortAscending: boolean): any[] {
    if (!sortColumn) return rows;

    var labelize = this.labelizer(sortColumn);

    if (sortAscending) {
      return rows.sort((a: any, b: any) => {
        if (labelize(a) < labelize(b)) {
          return -1;
        } else if (labelize(a) > labelize(b)) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    return rows.sort((a: any, b: any) => {
      if (labelize(a) < labelize(b)) {
        return 1;
      } else if (labelize(a) > labelize(b)) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  renderRows(rows: any[], columns: SimpleTableColumn[], sortColumn: SimpleTableColumn, sortAscending: boolean): JSX.Element[] {
    if (!rows || !rows.length) return null;

    rows = this.sortRows(rows, sortColumn, sortAscending);

    var items: JSX.Element[] = [];

    for (let i = 0; i < rows.length; i++) {
      items.push(this.renderRow(rows[i], columns, i));
    }

    return items;
  }

  getLayout(columns: SimpleTableColumn[], rows: any[], actions: SimpleTableAction[]) {
    const width = columns.reduce((a, b) => a + b.width, 0);

    const directActionsCount = actions.filter((a) => !a.inEllipsis).length;
    const indirectActionsCount = directActionsCount !== actions.length ? 1 : 0;

    return {
      // Inner dimensions
      bodyWidth: width,
      bodyHeight: rows.length * ROW_HEIGHT,

      // Gutters
      top: HEADER_HEIGHT,
      right: directActionsCount * 30 + indirectActionsCount * 30,
      bottom: 0,
      left: 0
    };
  }

  getDirectActions(actions: SimpleTableAction[]): SimpleTableAction[] {
    return actions.filter((action) => !action.inEllipsis);
  }

  renderActions(rows: any[], actions: SimpleTableAction[]): JSX.Element[] {
    const directActions = this.getDirectActions(actions);

    const generator = (row: any, i: number) => {
      let icons = directActions.map((action, i) => {
        return <div className="icon" key={`icon-${i}`} style={{width: ACTION_WIDTH}}>
          <SvgIcon className="icon" svg={require(`../../icons/${action.icon}.svg`)}/>
        </div>;
      });

      return <div className="row action" key={`action-${i}`} style={{height: ROW_HEIGHT}}>{icons}</div>;
    };

    return rows.map(generator);
  }

  onClick(x: number, y: number) {
    const { columns, rows, actions } = this.props;
    const headerWidth = columns.reduce((a, b) => a + b.width, 0);

    var columnIndex = -1; // -1 means right gutter
    var rowIndex = -1; // -1 means header

    // Not in the right gutter
    if (x < headerWidth) {
      columnIndex = 0;
      while ((x -= columns[columnIndex].width) > 0) columnIndex++;
    }

    // Not in the header
    if (y > HEADER_HEIGHT) {
      rowIndex = Math.floor((y - HEADER_HEIGHT) / ROW_HEIGHT);
    }

    // Corner
    if (rowIndex === -1 && columnIndex === -1) return;

    // Right gutter
    if (columnIndex === -1) {
      let action = actions[Math.floor((x - headerWidth) / ACTION_WIDTH)];
      if (action) this.onActionClick(action, rows[rowIndex]);
      return;
    }

    // Header
    if (rowIndex === -1) {
      this.onHeaderClick(columns[columnIndex]);
      return;
    }

    this.onCellClick(rows[rowIndex], columns[columnIndex]);
  }

  onCellClick(row: any, column: SimpleTableColumn) {
    if (this.props.onRowClick && row) {
      this.props.onRowClick(row);
    }
  }

  onHeaderClick(column: SimpleTableColumn) {
    this.setState({
      sortColumn: column,
      sortAscending: this.state.sortColumn === column ? !this.state.sortAscending : true
    });
  }

  onActionClick(action: SimpleTableAction, row: any) {
    action.callback(row);
  }

  render() {
    const { columns, rows, actions } = this.props;
    const { sortColumn, sortAscending } = this.state;

    if (!columns) return null;

    return <div className="simple-table">
      <Scroller
        ref="scroller"
        layout={this.getLayout(columns, rows, actions)}

        topRightCorner={<div></div>} // for styling purposes...
        topGutter={this.renderHeaders(columns, sortColumn, sortAscending)}
        rightGutter={this.renderActions(rows, actions)}

        body={this.renderRows(rows, columns, sortColumn, sortAscending)}

        onClick={this.onClick.bind(this)}
        // onMouseMove={this.onMouseMove.bind(this)}
        // onMouseLeave={this.onMouseLeave.bind(this)}
        // onScroll={this.onSimpleScroll.bind(this)}

      />


      {}
      {}
    </div>;
  }
}
