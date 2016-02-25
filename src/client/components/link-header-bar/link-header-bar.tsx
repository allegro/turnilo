require('./link-header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Datum, Dataset } from 'plywood';
import { Essence, DataSource } from "../../../common/models/index";

import { Modal } from '../modal/modal';

export interface LinkHeaderBarProps extends React.Props<any> {
  title: string;
  onNavClick: Function;
  getUrlPrefix?: Function;
}

export interface LinkHeaderBarState {
}

export class LinkHeaderBar extends React.Component<LinkHeaderBarProps, LinkHeaderBarState> {

  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    var { title, onNavClick } = this.props;

    return <header className="link-header-bar">
      <div className="left-bar" onClick={onNavClick as any}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
      </div>
    </header>;
  }
}
