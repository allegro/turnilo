'use strict';
require('./tile-header.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface TileHeaderProps {
  title: string;
  onDragStart: Function;
  onSearch: Function;
  onClose: Function;
}

export interface TileHeaderState {
}

export class TileHeader extends React.Component<TileHeaderProps, TileHeaderState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { title, onDragStart, onSearch, onClose } = this.props;

    var searchButton: React.DOMElement<any> = null;
    if (onSearch) {
      searchButton = JSX(`
        <div className="search" onClick={onSearch}>
          <SvgIcon name="loupe"/>
        </div>
      `);
    }

    return JSX(`
      <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
        <div className="title">{title}</div>
        {searchButton}
        <div className="close" onClick={onClose}>
          <SvgIcon name="x"/>
        </div>
      </div>
    `);
  }
}
