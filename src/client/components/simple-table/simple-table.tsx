require('./simple-table.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface InlineStyle {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  display?: string;
}

export interface SimpleTableProps extends React.Props<any> {
  scrollLeft: number;
  scrollTop: number;
  rowHeight: number;
  headerColumns: JSX.Element[];
  dataLength: number;
  rows: JSX.Element[];
  rowWidth: number;
  preRows?: JSX.Element;
  rowLeftOffset?: number;
  postRows?: JSX.Element;
}

export interface SimpleTableState {

}

export class SimpleTable extends React.Component<SimpleTableProps, SimpleTableState> {
  static getFirstElementToShow( rowHeight: number, scrollTop: number) {
    return Math.max(0, Math.floor(scrollTop / rowHeight));
  }

  static getLastElementToShow(rowHeight: number, datasetLength: number, scrollTop: number, visibleHeight: number) {
    return Math.min(datasetLength, Math.ceil((scrollTop + visibleHeight) / rowHeight));
  }

  static getRowStyle(topValue: number): InlineStyle {
    return {
      top: topValue
    };
  }

  getHeaderStyle(): InlineStyle {
    const { scrollLeft, rowWidth } = this.props;
    return {
      width: rowWidth,
      left: -scrollLeft
    };
  }

  getBodyStyle(): InlineStyle {
    const { scrollLeft, scrollTop, rowWidth, dataLength, rowHeight } = this.props;
    return {
      left: -scrollLeft,
      top: -scrollTop,
      width: rowWidth,
      height: dataLength * rowHeight
    };
  }

  getHorizontalShadowStyle(): InlineStyle {
    const { rowLeftOffset, rowWidth, scrollTop, scrollLeft } = this.props;
    var horizontalScrollShadowStyle: React.CSSProperties = { display: 'none' };
    if (scrollTop) {
      horizontalScrollShadowStyle = {
        width: (rowLeftOffset || 0) + rowWidth - scrollLeft
      };
    }

    return horizontalScrollShadowStyle;
  }

  render() {
    var { headerColumns, preRows, rows, postRows  } = this.props;

    return <div className="simple-table">
      <div className="header-cont">
        <div className="header" style={this.getHeaderStyle()}>{headerColumns}</div>
      </div>
      { preRows }
      <div className="body-cont">
        <div className="body" style={this.getBodyStyle()}>{rows}</div>
      </div>
      { postRows }
      <div className="horizontal-scroll-shadow" style={this.getHorizontalShadowStyle()}></div>
    </div>;
  }
}
