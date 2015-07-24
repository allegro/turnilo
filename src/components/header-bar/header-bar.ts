import React = require("react");
import Icon = require('react-svg-icons');
import { $, Expression, Datum, Dataset, NativeDataset } from 'plywood';

import { DataSource } from "../../models/index";

interface HeaderBarProps {
  dataSource: DataSource;
}

interface HeaderBarState {
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {
  render() {
    var { dataSource } = this.props;

    // <Icon name='cube' width={24} height={24} color='black'/>
    return JSX(`
      <header className="header-bar">
        <div className="dataset-title">{dataSource.title}</div>
        <div className="logo">imply</div>
      </header>
    `);
  }
}
