'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface TileHeaderProps {
  title: string;
  onDragStart: Function;
  onSearch: Function;
  onClose: Function;
}

interface TileHeaderState {
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
          <Icon name="loupe" width={12} height={12}/>
        </div>
      `);
    }

    return JSX(`
      <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
        <div className="title">{title}</div>
        {searchButton}
        <div className="close" onClick={onClose}>
          <Icon name="x" width={12} height={12}/>
        </div>
      </div>
    `);
  }
}
