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
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';

import { classNames } from '../../utils/dom/dom';

import { SvgIcon } from '../svg-icon/svg-icon';
import { Scroller, ScrollerPart } from '../scroller/scroller';

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
  hoveredRowIndex?: number;
  hoveredActionIndex?: number;
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
      ><SvgIcon svg={require(`../../icons/${action.icon}.svg`)}/></div>);
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
    const { hoveredRowIndex } = this.state;
    var items: JSX.Element[] = [];

    for (let i = 0; i < columns.length; i++) {
      let col = columns[i];

      let icon = col.cellIcon ? <SvgIcon svg={require(`../../icons/${col.cellIcon}.svg`)}/> : null;

      items.push(<div
        className={classNames('cell', {'has-icon': !!col.cellIcon})}
        style={{width: col.width}}
        key={`cell-${i}`}
      >{icon}{this.labelizer(col)(row)}</div>);
    }

    return <div
      className={classNames('row', {hover: hoveredRowIndex === index})}
      key={`row-${index}`}
      style={{height: ROW_HEIGHT}}
    >
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
    const { hoveredRowIndex, hoveredActionIndex } = this.state;

    const directActions = this.getDirectActions(actions);

    const generator = (row: any, i: number) => {
      let isRowHovered = i === hoveredRowIndex;

      let icons = directActions.map((action, j) => {
        return <div
          className={classNames("icon", {hover: isRowHovered && j === hoveredActionIndex})}
          key={`icon-${j}`}
          style={{width: ACTION_WIDTH}}
        >
          <SvgIcon svg={require(`../../icons/${action.icon}.svg`)}/>
        </div>;
      });

      return <div
        className={classNames("row action", {hover: isRowHovered})}
        key={`action-${i}`}
        style={{height: ROW_HEIGHT}}
      >
        {icons}
      </div>;
    };

    return rows.map(generator);
  }

  getRowIndex(y: number): number {
    var rowIndex = -1; // -1 means header

    // Not in the header
    if (y > HEADER_HEIGHT) {
      rowIndex = Math.floor((y - HEADER_HEIGHT) / ROW_HEIGHT);
    }

    return rowIndex;
  }

  getActionIndex(x: number, headerWidth: number): number {
    const { actions } = this.props;

    return Math.floor((x - headerWidth) / ACTION_WIDTH);
  }

  getColumnIndex(x: number, headerWidth: number): number {
    if (x >= headerWidth) return -1;

    const { columns } = this.props;

    var columnIndex = 0;
    while ((x -= columns[columnIndex].width) > 0) columnIndex++;

    return columnIndex;
  }

  getHeaderWidth(columns: SimpleTableColumn[]): number {
    return columns.reduce((a, b) => a + b.width, 0);
  }

  onClick(x: number, y: number, part: ScrollerPart) {
    const { columns, rows, actions } = this.props;

    if (part === Scroller.TOP_RIGHT_CORNER) return;

    const headerWidth = this.getHeaderWidth(columns);

    var columnIndex = this.getColumnIndex(x, headerWidth); // -1 means right gutter
    var rowIndex = this.getRowIndex(y); // -1 means header

    if (part === Scroller.RIGHT_GUTTER) {
      let action = actions[this.getActionIndex(x, headerWidth)];
      if (action) {
        this.onActionClick(action, rows[rowIndex]);
        return;
      }
    }

    // Header
    if (part === Scroller.TOP_GUTTER) {
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

  onMouseMove(x: number, y: number, part: ScrollerPart) {
    const { rows, columns } = this.props;
    const headerWidth = this.getHeaderWidth(columns);

    var rowIndex = this.getRowIndex(y);

    this.setState({
      hoveredRowIndex: rowIndex > rows.length ? undefined : rowIndex,
      hoveredActionIndex: part === Scroller.RIGHT_GUTTER ? this.getActionIndex(x, headerWidth) : undefined
    });
  }

  onMouseLeave() {
    this.setState({
      hoveredRowIndex: undefined,
      hoveredActionIndex: undefined
    });
  }

  render() {
    const { columns, rows, actions } = this.props;
    const { sortColumn, sortAscending, hoveredRowIndex } = this.state;

    if (!columns) return null;

    return <div className={classNames("simple-table", {clickable: hoveredRowIndex !== undefined})}>
      <Scroller
        ref="scroller"
        layout={this.getLayout(columns, rows, actions)}

        topRightCorner={<div></div>} // for styling purposes...
        topGutter={this.renderHeaders(columns, sortColumn, sortAscending)}
        rightGutter={this.renderActions(rows, actions)}

        body={this.renderRows(rows, columns, sortColumn, sortAscending)}

        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
      />
    </div>;
  }
}
