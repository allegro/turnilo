import * as React from 'react/addons';
import Icon = require('react-svg-icons');
import { $, Expression, Datum, Dataset } from 'plywood';

import { DataSource } from "../../models/index";

interface HeaderBarProps {
  dataSource: DataSource;
  onNavClick: () => void;
}

interface HeaderBarState {
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {
  render() {
    var { dataSource, onNavClick } = this.props;

    return JSX(`
      <header className="header-bar">
        <div className="burger-bar" onClick={onNavClick}>
          <Icon className="arrow-logo" name="arrow-logo" width={18} height={18} color="white"/>
          <div className="dataset-title">{dataSource.title}</div>
        </div>
        <Icon className="text-logo" name="text-logo" height={20} color="white"/>
      </header>
    `);
  }
}
