'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface TileHeaderProps {
  title: string;
  onSearch: () => void;
  onClose: () => void;
}

interface TileHeaderState {
}

export class TileHeader extends React.Component<TileHeaderProps, TileHeaderState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: TileHeaderProps) {

  }

  render() {
    var { title, onSearch, onClose } = this.props;

    return JSX(`
      <div className="tile-header">
        <div className="title">{title}</div>
        <div className="search" onClick={onSearch}>Q</div>
        <div className="close" onClick={onClose}>X</div>
      </div>
    `);
  }
}
