import React = require("react");
import Icon = require('react-svg-icons');
import { $, Expression, Datum, Dataset, NativeDataset } from 'plywood';

import { Filter, Dimension, Measure } from "../../models/index";

interface HeaderBarProps {
}

interface HeaderBarState {
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {
  render() {
    // <Icon name='cube' width={24} height={24} color='black'/>
    return JSX(`
      <header className="header-bar">
        <div className="dataset-title">Wikipedia</div>
        <div className="logo">imply</div>
      </header>
    `);
  }
}
