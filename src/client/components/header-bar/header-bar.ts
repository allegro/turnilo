'use strict';
require('./header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Datum, Dataset } from 'plywood';
import { Essence } from "../../../common/models/index";

function panic() {
  window.location.assign(Essence.getBaseURL());
}

export interface HeaderBarProps {
  essence: Essence;
  onNavClick: Function;
}

export interface HeaderBarState {
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {

  constructor() {
    super();
    //this.state = {}
  }

  render() {
    var { essence, onNavClick } = this.props;

    return JSX(`
      <header className="header-bar">
        <div className="burger-bar" onClick={onNavClick}>
          <SvgIcon className="menu" name="menu" color="white"/>
          <div className="dataset-title">{essence.dataSource.title}</div>
        </div>
        <div className="right-bar">
          <div className="icon-button panic" onClick={panic}>
            <SvgIcon className="panic-icon" name="panic" color="white"/>
          </div>
          <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
            <SvgIcon className="help-icon" name="help" color="white"/>
          </a>
          <a className="icon-button github" href="https://github.com/implydata/pivot" target="_blank">
            <SvgIcon className="github-icon" name="github" color="white"/>
          </a>
        </div>
      </header>
    `);
  }
}
