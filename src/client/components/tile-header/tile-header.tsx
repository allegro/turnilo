require('./tile-header.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface TileHeaderProps extends React.Props<any> {
  title: string;
  onDragStart?: React.DragEventHandler;
  onSearch?: React.MouseEventHandler;
  onClose?: React.MouseEventHandler;
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

    var icons: JSX.Element[] = [];

    if (onSearch) {
      icons.push(<div className="icon search" key="search" onClick={onSearch}>
        <SvgIcon svg={require('../../icons/full-search.svg')}/>
      </div>);
    }

    if (onClose) {
      icons.push(<div className="icon close" key="close" onClick={onClose}>
        <SvgIcon svg={require('../../icons/full-remove.svg')}/>
      </div>);
    }

    return <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
      <div className="title">{title}</div>
      <div className="icons">{icons}</div>
    </div>;
  }
}
