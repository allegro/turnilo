require('./tile-header.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface TileHeaderProps extends React.Props<any> {
  title: string;
  onDragStart: React.DragEventHandler;
  onSearch: React.MouseEventHandler;
  onClose: React.MouseEventHandler;
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

    var searchButton: JSX.Element = null;
    if (onSearch) {
      searchButton = <div className="search" onClick={onSearch} ref="searchButton">
        <SvgIcon svg={require('../../icons/loupe.svg')}/>
      </div>;
    }

    return <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
      <div className="title">{title}</div>
      {searchButton}
      <div className="close" onClick={onClose}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    </div>;
  }
}
