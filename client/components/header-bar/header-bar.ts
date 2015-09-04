'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Datum, Dataset } from 'plywood';

import { Essence } from "../../models/index";

interface HeaderBarProps {
  essence: Essence;
  onNavClick: () => void;
}

interface HeaderBarState {
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {

  constructor() {
    super();
    //this.state = {}
  }

  onLogoClick() {
    window.location.assign(Essence.getBaseURL());
  }

  render() {
    var { essence, onNavClick } = this.props;

    return JSX(`
      <header className="header-bar">
        <div className="burger-bar" onClick={onNavClick}>
          <Icon className="menu" name="menu" height={12} color="white"/>
          <div className="dataset-title">{essence.dataSource.title}</div>
        </div>
        <div className="right-bar" onClick={this.onLogoClick}>
          <Icon className="text-logo" name="text-logo" height={20} color="white"/>
        </div>
      </header>
    `);
  }
}
